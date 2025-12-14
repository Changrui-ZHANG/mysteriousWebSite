import { useState, useEffect, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import BrickBreaker from '../features/games/components/BrickBreaker';
import Match3 from '../features/games/components/Match3';
import PokemonGame from '../features/games/components/PokemonGame';
import MazeGame from '../features/games/components/MazeGame';
import Leaderboard from '../features/games/components/Leaderboard';
import { fetchJson, postJson } from '../utils/api';
import { useAdminCode } from '../hooks/useAdminCode';
import { API_ENDPOINTS } from '../constants/api';

interface GameProps {
    isDarkMode: boolean;
    user?: User | null;
    onOpenLogin: () => void;
    isSuperAdmin?: boolean;
    isAdmin?: boolean;
}

interface User {
    userId: string;
    username: string;
}

export function Game({ isDarkMode, user, onOpenLogin, isSuperAdmin = false, isAdmin = false }: GameProps) {
    const { t } = useTranslation();
    const adminCode = useAdminCode();
    const [activeGame, setActiveGame] = useState<'brick' | 'match3' | 'pokemon' | 'maze'>('brick');

    // Stats State
    const [personalBest, setPersonalBest] = useState<{ score: number, attempts?: number } | null>(null);
    const [refreshLeaderboard, setRefreshLeaderboard] = useState(0);
    const [gameStatuses, setGameStatuses] = useState<Record<string, boolean>>({});

    // Guest Alert Logic
    const [showGuestAlert, setShowGuestAlert] = useState(false);
    const hasGuestAlertShownRef = useRef(false);

    // Fetch Game Statuses
    useEffect(() => {
        fetchJson<any[]>(API_ENDPOINTS.GAMES.LIST)
            .then(data => {
                const statusMap: Record<string, boolean> = {};
                data.forEach((s: any) => {
                    statusMap[s.gameType] = s.enabled;
                });
                setGameStatuses(statusMap);
            })
            .catch(error => console.error("Failed to fetch game statuses", error));
    }, []);

    const toggleGameStatus = async (gameKey: string) => {
        if (!adminCode) {
            const input = prompt(t('game.admin_code_prompt') || "Admin Code:");
            if (!input) return;

            try {
                const updatedStatus = await postJson<any>(`${API_ENDPOINTS.GAMES.TOGGLE.replace('{gameType}', gameKey)}?adminCode=${input}`, {});
                setGameStatuses(prev => ({
                    ...prev,
                    [updatedStatus.gameType]: updatedStatus.enabled
                }));
            } catch (error) {
                console.error("Error toggling game status", error);
            }
            return;
        }

        try {
            const updatedStatus = await postJson<any>(`${API_ENDPOINTS.GAMES.TOGGLE.replace('{gameType}', gameKey)}?adminCode=${adminCode}`, {});
            setGameStatuses(prev => ({
                ...prev,
                [updatedStatus.gameType]: updatedStatus.enabled
            }));
        } catch (error) {
            console.error("Error toggling game status", error);
        }
    };

    const getGameColor = (gameKey: string) => {
        switch (gameKey) {
            case 'brick': return 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]';
            case 'match3': return 'bg-fuchsia-500 text-black shadow-[0_0_20px_rgba(217,70,239,0.5)]';
            case 'pokemon': return 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]';
            case 'maze': return 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]';
            default: return 'bg-white/10';
        }
    };

    // Reset Alert when switching games or starting new one
    const resetGuestAlert = () => {
        hasGuestAlertShownRef.current = false;
    };

    useEffect(() => {
        resetGuestAlert();
    }, [activeGame]);

    useEffect(() => {
        const fetchPersonalBest = async () => {
            if (!user || !user.userId) {
                setPersonalBest(null);
                return;
            }
            try {
                // Use fetchJson for auto-unwrapping ApiResponse
                const data = await fetchJson<any>(`/api/scores/user/${user.userId}/${activeGame}?_t=${Date.now()}`);
                setPersonalBest({ score: data.score, attempts: data.attempts });
            } catch (error) {
                console.error("Failed to fetch personal best", error);
                setPersonalBest({ score: 0 });
            }
        };
        fetchPersonalBest();
    }, [user, activeGame, refreshLeaderboard]);

    const submitScore = async (score: number, attempts?: number) => {
        if (!user) {
            // For guests: Check if valid score for leaderboard
            if (score <= 0) return;

            // Stop if already shown once
            if (hasGuestAlertShownRef.current) return;

            try {
                // Fetch current top 3 using fetchJson
                const topScores: any[] = await fetchJson(`/api/scores/top/${activeGame}`);

                // Logic: Eligible if board has space (<3) OR score beats the worst one on board
                let isEligible = false;

                if (topScores.length < 3) {
                    isEligible = true;
                } else {
                    const thresholdScoreVal = topScores[topScores.length - 1].score;
                    if (activeGame === 'maze') {
                        // Lower is better (and assume threshold > 0, though we fixed 0 bug)
                        if (score < thresholdScoreVal || thresholdScoreVal === 0) {
                            isEligible = true;
                        }
                    } else {
                        // Higher is better
                        if (score > thresholdScoreVal) {
                            isEligible = true;
                        }
                    }
                }

                if (isEligible) {
                    setShowGuestAlert(true);
                    hasGuestAlertShownRef.current = true;
                }
            } catch (err) {
                console.error("Guest score check failed", err);
            }
            return;
        }

        // Only submit if it's a new high score (or low score for maze)
        // Determine if logic should trigger local optimistic update (isNewBest)
        // But ALWAYS submit to backend to ensure data consistency
        let isNewBest = false;
        if (personalBest && personalBest.score !== undefined) {
            if (activeGame === 'maze') {
                // For maze, lower is better.
                // Improvement if score < current best
                if (score < personalBest.score || personalBest.score === 0) {
                    isNewBest = true;
                }
            } else {
                // For others, higher is better.
                if (score > personalBest.score) {
                    isNewBest = true;
                }
            }
        } else {
            isNewBest = true;
        }

        try {
            if (!user.userId) {
                console.error("Cannot submit score: User ID is missing");
                return;
            }
            const result = await postJson('/api/scores', {
                gameType: activeGame,
                score: score,
                userId: user.userId,
                username: user.username,
                attempts: attempts
            });
            console.log("Score submission result:", result);

            // Update local state without fetching
            if (isNewBest) {
                setPersonalBest({ score, attempts });
            }
            // Trigger leaderboard refresh (Top 3 only)
            setRefreshLeaderboard(prev => prev + 1);
        } catch (error) {
            console.error("Failed to submit score", error);
            alert("Error saving score: " + error);
        }
    };

    return (
        <div className={`min-h-screen pt-24 pb-12 px-4 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center w-full"
                    >
                        <h1 className="text-4xl md:text-7xl font-black font-heading mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                            {t('game.arcade_zone')}
                        </h1>
                        <p className="text-xl opacity-70 font-serif italic">
                            {t('game.choose_your_challenge')}
                        </p>
                    </motion.div>
                </div>

                <div className="mb-12">
                    <Leaderboard
                        gameType={activeGame}
                        refreshTrigger={refreshLeaderboard}
                        isDarkMode={isDarkMode}
                        isSuperAdmin={isSuperAdmin}
                    />
                </div>

                {/* Game Selector Tabs */}
                {/* Game Selector Tabs */}
                <div className="flex justify-center gap-4 md:gap-8 mb-12 flex-wrap">
                    {['brick', 'match3', 'pokemon', 'maze'].map((gameKey) => {
                        const isEnabled = gameStatuses[gameKey] !== false; // Default true if undefined
                        const isLocked = !isEnabled && !isSuperAdmin;

                        return (
                            <div key={gameKey} className="relative group flex flex-col items-center gap-2">
                                <button
                                    onClick={() => setActiveGame(gameKey as any)}
                                    // Make button appear disabled if locked, but Admins can always click to test
                                    disabled={isLocked && !isSuperAdmin && !isAdmin}
                                    className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-xl font-bold transition-all duration-300 transform ${activeGame === gameKey
                                        ? 'scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                        : 'hover:scale-105'
                                        } ${!isEnabled
                                            ? 'bg-gray-800 text-gray-500 opacity-70 grayscale border border-red-500/50'
                                            : activeGame === gameKey
                                                ? getGameColor(gameKey)
                                                : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {t(`game.${gameKey === 'brick' ? 'brick_breaker' : gameKey === 'pokemon' ? 'pokemon_quiz' : gameKey}`)}
                                    {!isEnabled && <span className="absolute -top-2 -right-2 bg-red-600 text-[10px] px-1 rounded text-white shadow-sm font-bold tracking-widest">OFF</span>}
                                </button>

                                {/* Admin Game Controls - Always Visible for Any Admin */}
                                {(isSuperAdmin || isAdmin) && (
                                    <div className="flex flex-col items-center gap-1 mt-1">
                                        <div className={`text-[10px] font-mono font-bold ${isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                            [{isEnabled ? 'ACTIVE' : 'DISABLED'}]
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleGameStatus(gameKey);
                                            }}
                                            className={`text-[10px] font-bold px-4 py-1.5 rounded-full border transition-colors shadow-lg ${isEnabled
                                                ? 'bg-red-900/40 border-red-500 text-red-200 hover:bg-red-600 hover:text-white'
                                                : 'bg-green-900/40 border-green-500 text-green-200 hover:bg-green-600 hover:text-white'
                                                }`}
                                        >
                                            {isEnabled ? 'DISABLE' : 'ENABLE'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Login Warning for Unauthenticated Users */}
                {!user && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-center py-2 mb-4 text-sm font-bold mx-auto max-w-3xl ${isDarkMode ? 'text-yellow-400 bg-yellow-400/10' : 'text-orange-600 bg-orange-100'} rounded-lg border border-yellow-500/30`}
                    >
                        ⚠️ <Trans i18nKey="game.login_warning" components={[<button key="0" onClick={onOpenLogin} className="underline hover:text-pink-500 transition-colors mx-1 cursor-pointer" />]} />
                    </motion.div>
                )}

                {/* Game Container */}
                <div className={`relative w-full max-w-5xl mx-auto ${activeGame === 'pokemon' ? 'min-h-[700px] md:min-h-[800px]' : activeGame === 'maze' ? 'min-h-[600px] md:aspect-auto' : 'min-h-[500px] md:min-h-0 md:aspect-video'} grid grid-cols-1`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeGame}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full col-start-1 row-start-1"
                        >
                            {(() => {
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

                                return activeGame === 'brick' ? (
                                    <BrickBreaker isDarkMode={isDarkMode} onSubmitScore={submitScore} personalBest={personalBest} isAuthenticated={!!user} />
                                ) : activeGame === 'match3' ? (
                                    <Match3 isDarkMode={isDarkMode} onSubmitScore={submitScore} personalBest={personalBest} isAuthenticated={!!user} onGameStart={resetGuestAlert} />
                                ) : activeGame === 'pokemon' ? (
                                    <PokemonGame isDarkMode={isDarkMode} onSubmitScore={submitScore} personalBest={personalBest} isAuthenticated={!!user} onGameStart={resetGuestAlert} />
                                ) : (
                                    <MazeGame isDarkMode={isDarkMode} onSubmitScore={submitScore} personalBest={personalBest} isAuthenticated={!!user} onGameStart={resetGuestAlert} />
                                );
                            })()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            {/* Guest High Score Alert Modal */}
            <AnimatePresence>
                {showGuestAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowGuestAlert(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()} // Prevent close on modal click
                            className={`bg-white/10 border border-white/20 backdrop-blur-md p-6 md:p-8 rounded-2xl max-w-sm w-full shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center relative overflow-hidden`}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>

                            <h3 className="text-2xl font-black font-heading mb-4 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                                <Trans i18nKey="game.you_win" /> {/* Reusing 'You Win' or just Generic Title */}
                                🏆
                            </h3>

                            <p className="text-white/90 mb-6 font-medium text-lg">
                                {t('game.highscore_guest_alert')}
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setShowGuestAlert(false);
                                        onOpenLogin();
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-pink-500/25"
                                >
                                    {t('auth.login')} / {t('auth.register')}
                                </button>
                                <button
                                    onClick={() => setShowGuestAlert(false)}
                                    className="w-full py-2 text-white/50 hover:text-white transition-colors text-sm font-bold"
                                >
                                    {t('admin.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
