import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import BrickBreaker from '../features/games/components/BrickBreaker';
import Match3 from '../features/games/components/Match3';
import PokemonGame from '../features/games/components/PokemonGame';
import MazeGame from '../features/games/components/MazeGame';
import ZombieShooter from '../features/games/components/ZombieShooter';
import Leaderboard from '../features/games/components/Leaderboard';
import { fetchJson, postJson } from '../api/httpClient';
import { useAdminCode } from '../hooks/useAdminCode';

import { API_ENDPOINTS } from '../constants/endpoints';
import { GradientHeading } from '../components';
import { GameSelector, GuestAlertModal } from '../components/game';
import type { GameKey, GameStatus, PersonalBest, ScoreData, TopScore, GameProps } from '../types/game';

export function Game({ isDarkMode, user, onOpenLogin, isSuperAdmin = false, isAdmin = false }: GameProps) {
    const { t } = useTranslation();
    const adminCode = useAdminCode();
    const [activeGame, setActiveGame] = useState<GameKey>('brick');

    const [personalBest, setPersonalBest] = useState<PersonalBest | null>(null);
    const [refreshLeaderboard, setRefreshLeaderboard] = useState(0);
    const [gameStatuses, setGameStatuses] = useState<Record<string, boolean>>({});

    const [showGuestAlert, setShowGuestAlert] = useState(false);
    const hasGuestAlertShownRef = useRef(false);

    // Fetch Game Statuses
    useEffect(() => {
        fetchJson<GameStatus[]>(API_ENDPOINTS.GAMES.LIST)
            .then(data => {
                const statusMap: Record<string, boolean> = {};
                data.forEach((s) => { statusMap[s.gameType] = s.enabled; });
                setGameStatuses(statusMap);
            })
            .catch(error => console.error("Failed to fetch game statuses", error));
    }, []);

    const toggleGameStatus = async (gameKey: string) => {
        const code = adminCode || prompt(t('game.admin_code_prompt'));
        if (!code) return;

        try {
            const updatedStatus = await postJson<GameStatus>(`${API_ENDPOINTS.GAMES.TOGGLE.replace('{gameType}', gameKey)}?adminCode=${code}`, {});
            setGameStatuses(prev => ({ ...prev, [updatedStatus.gameType]: updatedStatus.enabled }));
        } catch (error) {
            console.error("Error toggling game status", error);
        }
    };

    const resetGuestAlert = () => { hasGuestAlertShownRef.current = false; };

    useEffect(() => { resetGuestAlert(); }, [activeGame]);

    useEffect(() => {
        const fetchPersonalBest = async () => {
            if (!user?.userId) { setPersonalBest(null); return; }
            try {
                const data = await fetchJson<ScoreData>(`/api/scores/user/${user.userId}/${activeGame}`);
                setPersonalBest({ score: data.score, attempts: data.attempts });
            } catch (error) {
                console.error("Failed to fetch personal best", error);
                setPersonalBest({ score: 0 });
            }
        };
        fetchPersonalBest();
    }, [user, activeGame, refreshLeaderboard]);

    const submitScore = useCallback(async (score: number, attempts?: number) => {
        if (!user) {
            if (score <= 0 || hasGuestAlertShownRef.current) return;
            try {
                const topScores = await fetchJson<TopScore[]>(`/api/scores/top/${activeGame}`);
                let isEligible = topScores.length < 3;
                if (!isEligible && topScores.length >= 3) {
                    const thresholdScore = topScores[topScores.length - 1].score;
                    isEligible = activeGame === 'maze'
                        ? (score < thresholdScore || thresholdScore === 0)
                        : score > thresholdScore;
                }
                if (isEligible) {
                    setShowGuestAlert(true);
                    hasGuestAlertShownRef.current = true;
                }
            } catch (err) { console.error("Guest score check failed", err); }
            return;
        }

        let isNewBest = !personalBest || (activeGame === 'maze'
            ? (score < personalBest.score || personalBest.score === 0)
            : score > personalBest.score);

        if (!isNewBest) return;

        try {
            await postJson('/api/scores', {
                gameType: activeGame,
                score,
                userId: user.userId,
                username: user.username,
                attempts
            });
            setPersonalBest({ score, attempts });
            setRefreshLeaderboard(prev => prev + 1);
        } catch (error) {
            console.error("Failed to submit score", error);
        }
    }, [user, activeGame, personalBest]);

    const renderGame = () => {
        const isEnabled = gameStatuses[activeGame] !== false;
        const isLocked = !isEnabled && !isSuperAdmin && !isAdmin;

        if (isLocked) {
            return (
                <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('game.game_disabled')}</h2>
                    <p className="text-white/60">{t('game.game_disabled_desc')}</p>
                </div>
            );
        }

        const commonProps = { isDarkMode, onSubmitScore: submitScore, personalBest, isAuthenticated: !!user, onGameStart: resetGuestAlert };

        switch (activeGame) {
            case 'brick': return <BrickBreaker {...commonProps} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />;
            case 'match3': return <Match3 {...commonProps} />;
            case 'pokemon': return <PokemonGame {...commonProps} />;
            case 'maze': return <MazeGame {...commonProps} />;
            case 'zombie': return <ZombieShooter {...commonProps} />;
        }
    };

    return (
        <div className="page-container pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full mb-8">
                    <GradientHeading gradient="purple-pink" level={1} className="mb-4">{t('game.arcade_zone')}</GradientHeading>
                    <p className="text-xl opacity-70 font-serif italic">{t('game.choose_your_challenge')}</p>
                </motion.div>

                <div className="mb-12">
                    <Leaderboard gameType={activeGame} refreshTrigger={refreshLeaderboard} isSuperAdmin={isSuperAdmin} />
                </div>

                <GameSelector
                    activeGame={activeGame}
                    onSelectGame={setActiveGame}
                    gameStatuses={gameStatuses}
                    onToggleStatus={toggleGameStatus}
                    isAdmin={isAdmin}
                    isSuperAdmin={isSuperAdmin}
                />

                {!user && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className={`text-center py-2 mb-4 text-sm font-bold mx-auto max-w-3xl ${isDarkMode ? 'text-yellow-400 bg-yellow-400/10' : 'text-orange-600 bg-orange-100'} rounded-lg border border-yellow-500/30`}>
                        ⚠️ <Trans i18nKey="game.login_warning" components={[<button key="0" onClick={onOpenLogin} className="underline hover:text-pink-500 transition-colors mx-1 cursor-pointer" />]} />
                    </motion.div>
                )}

                <div className={`relative w-full max-w-5xl mx-auto ${activeGame === 'pokemon' ? 'min-h-[700px] md:min-h-[800px]' : activeGame === 'maze' ? 'min-h-[600px] md:aspect-auto' : 'min-h-[500px] md:min-h-0 md:aspect-video'} grid grid-cols-1`}>
                    <AnimatePresence mode="wait">
                        <motion.div key={activeGame} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full h-full col-start-1 row-start-1">
                            {renderGame()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <GuestAlertModal isOpen={showGuestAlert} onClose={() => setShowGuestAlert(false)} onLogin={onOpenLogin} />
        </div>
    );
}
