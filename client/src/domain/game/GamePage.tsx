import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaGamepad, FaLock } from 'react-icons/fa';
import BrickBreaker from './components/BrickBreaker';
import Match3 from './components/Match3';
import PokemonGame from './components/PokemonGame';
import MazeGame from './components/MazeGame';
import ZombieShooter from './components/ZombieShooter';
import Leaderboard from './components/Leaderboard';
import { fetchJson, postJson } from '../../shared/api/httpClient';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useAdminCode } from '../../shared/hooks/useAdminCode';

import { API_ENDPOINTS } from '../../shared/constants/endpoints';
import { GuestAlertModal } from './components/index';
import type { GameKey, GameStatus, PersonalBest, ScoreData, TopScore, GameProps } from './types';

// Game configuration
const GAME_KEYS: GameKey[] = ['brick', 'match3', 'pokemon', 'maze', 'zombie'];

const getGameLabel = (gameKey: GameKey, t: any) => {
    switch (gameKey) {
        case 'brick': return t('game.brick_breaker');
        case 'pokemon': return t('game.pokemon_quiz');
        default: return t(`game.${gameKey}`);
    }
};

export function Game(_props: GameProps) {
    const { t } = useTranslation();
    const { user, isAdmin, isSuperAdmin, openAuthModal: onOpenLogin } = useAuth();
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
                const data = await fetchJson<ScoreData>(API_ENDPOINTS.GAMES.USER_SCORE(user.userId, activeGame));
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
                const topScores = await fetchJson<TopScore[]>(API_ENDPOINTS.GAMES.TOP_SCORES(activeGame));
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
            await postJson(API_ENDPOINTS.GAMES.SUBMIT_SCORE, {
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
                <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-4 md:p-8 text-center">
                    <div className="error-container backdrop-blur-xl border rounded-xl p-6 md:p-8 shadow-lg max-w-md mx-auto">
                        <FaLock className="error-icon text-4xl md:text-6xl mb-2 md:mb-4 drop-shadow-lg mx-auto" />
                        <h2 className="error-title text-lg md:text-2xl font-bold mb-1 md:mb-2 drop-shadow-sm">{t('game.game_disabled')}</h2>
                        <p className="error-text text-sm md:text-base">{t('game.game_disabled_desc')}</p>
                    </div>
                </div>
            );
        }

        const baseProps = {
            onSubmitScore: submitScore,
            personalBest,
            isAuthenticated: !!user,
            onGameStart: resetGuestAlert
        };

        switch (activeGame) {
            case 'brick': return <BrickBreaker key="brick" {...baseProps} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />;
            case 'match3': return <Match3 key="match3" {...baseProps} />;
            case 'pokemon': return <PokemonGame key="pokemon" {...baseProps} />;
            case 'maze': return <MazeGame key="maze" {...baseProps} />;
            case 'zombie': return <ZombieShooter key="zombie" {...baseProps} />;
        }
    };

    return (
        <div className="page-container pt-16 md:pt-20 pb-4 md:pb-8 relative overflow-hidden min-h-screen">
            {/* Gaming Background Effects - Optimized for both themes */}
            <div className="absolute inset-0 bg-effects pointer-events-none">
                <div className="absolute top-10 left-10 w-32 md:w-48 h-32 md:h-48 bg-gradient-to-br from-purple-600/40 via-cyan-500/30 to-pink-600/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-40 md:w-60 h-40 md:h-60 bg-gradient-to-br from-blue-600/35 via-indigo-600/25 to-purple-700/25 rounded-full blur-2xl animate-pulse delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-indigo-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
            </div>

            {/* Main Layout Container */}
            <div className="max-w-[1600px] mx-auto px-3 md:px-6 relative z-10">
                {/* Full Width Horizontal Leaderboard - Top */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-0 overflow-hidden"
                >
                    <Leaderboard
                        gameType={activeGame}
                        refreshTrigger={refreshLeaderboard}
                        isAdmin={isAdmin}
                        isSuperAdmin={isSuperAdmin}
                        horizontal={true}
                    />
                </motion.div>

                {/* Game Selector + GameWindow Row */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Game Selector - Left Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-[280px] flex-shrink-0 order-2 lg:order-1"
                    >
                        <div className="bg-surface backdrop-blur-xl border border-default rounded-2xl p-4 shadow-lg h-full lg:h-[600px] flex flex-col">
                            <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                                <FaGamepad className="text-purple-600" />
                                {t('game.select_game')}
                            </h3>
                            <div className="flex-1 flex flex-col gap-2">
                                {GAME_KEYS.map((gameKey) => {
                                    const isEnabled = gameStatuses[gameKey] !== false;
                                    const isLocked = !isEnabled && !isSuperAdmin;
                                    const isActive = activeGame === gameKey;

                                    return (
                                        <button
                                            key={gameKey}
                                            onClick={() => !isLocked && setActiveGame(gameKey)}
                                            disabled={isLocked}
                                            className={`flex-1 p-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between group min-h-[44px] cursor-pointer ${isActive
                                                ? 'game-button-active'
                                                : isLocked
                                                    ? 'game-button-locked'
                                                    : 'game-button-inactive'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${isActive ? 'game-indicator-active' : isLocked ? 'game-indicator-inactive' : 'game-indicator-inactive group-hover:game-indicator-inactive'}`} />
                                                <span className={`font-medium text-sm transition-colors duration-200 ${isActive ? 'game-text-active' : isLocked ? 'text-muted' : 'game-text-inactive group-hover:game-text-inactive'}`}>
                                                    {getGameLabel(gameKey, t)}
                                                </span>
                                            </div>
                                            {isLocked && <FaLock className="text-xs text-accent-danger" />}
                                            {isActive && <span className="text-accent-secondary animate-pulse">▶</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Admin Controls */}
                            {(isSuperAdmin || isAdmin) && (
                                <div className="mt-4 pt-4 border-t border-subtle">
                                    <p className="text-xs text-secondary mb-2 font-medium">Admin Controls:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {GAME_KEYS.map((gameKey) => {
                                            const isEnabled = gameStatuses[gameKey] !== false;
                                            return (
                                                <button
                                                    key={`admin-${gameKey}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleGameStatus(gameKey);
                                                    }}
                                                    className={`text-xs px-2 py-1 rounded-md transition-all duration-200 min-h-[32px] cursor-pointer font-medium ${isEnabled
                                                        ? 'status-success'
                                                        : 'status-error'
                                                        }`}
                                                >
                                                    {gameKey.slice(0, 3)} {isEnabled ? '✓' : '✗'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Login Prompt - Compact */}
                            {!user && (
                                <div className="mt-4 pt-4 border-t border-subtle">
                                    <div className="text-center">
                                        <p className="text-xs text-secondary mb-2">
                                            {t('game.login_for_scores')}
                                        </p>
                                        <button
                                            onClick={onOpenLogin}
                                            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-200 text-sm min-h-[40px] shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer"
                                        >
                                            {t('auth.login')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Game Window - Right Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 order-1 lg:order-2 min-h-[50vh] sm:min-h-[60vh] lg:min-h-[600px] w-full flex flex-col min-w-0 overflow-hidden"
                    >
                        <div className="bg-surface backdrop-blur-xl border border-default rounded-2xl shadow-lg h-full overflow-hidden">
                            {renderGame()}
                        </div>
                    </motion.div>
                </div>
            </div>

            <GuestAlertModal isOpen={showGuestAlert} onClose={() => setShowGuestAlert(false)} onLogin={onOpenLogin} />
        </div>
    );
}
