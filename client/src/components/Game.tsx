import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import BrickBreaker from './games/BrickBreaker';
import Match3 from './games/Match3';
import PokemonGame from './games/PokemonGame';
import MazeGame from './games/MazeGame';
import Leaderboard from './Leaderboard';

interface GameProps {
    isDarkMode: boolean;
    user?: User | null;
    onOpenLogin: () => void;
    isSuperAdmin?: boolean;
}

interface User {
    userId: string;
    username: string;
}

export function Game({ isDarkMode, user, onOpenLogin, isSuperAdmin = false }: GameProps) {
    const { t } = useTranslation();
    const [activeGame, setActiveGame] = useState<'brick' | 'match3' | 'pokemon' | 'maze'>('brick');

    // Stats State
    const [personalBest, setPersonalBest] = useState<{ score: number, attempts?: number } | null>(null);
    const [refreshLeaderboard, setRefreshLeaderboard] = useState(0);

    useEffect(() => {
        const fetchPersonalBest = async () => {
            if (!user) {
                setPersonalBest(null);
                return;
            }
            try {
                // Ensure no spaces in URL and bypass cache
                const response = await fetch(`/api/scores/user/${user.userId}/${activeGame}?_t=${Date.now()}`);
                if (response.ok) {
                    const data = await response.json();
                    setPersonalBest({ score: data.score, attempts: data.attempts });
                } else {
                    setPersonalBest({ score: 0 });
                }
            } catch (error) {
                console.error("Failed to fetch personal best", error);
                setPersonalBest({ score: 0 });
            }
        };
        fetchPersonalBest();
    }, [user, activeGame, refreshLeaderboard]);

    const submitScore = async (score: number, attempts?: number) => {
        if (!user) {
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
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameType: activeGame,
                    score: score,
                    userId: user.userId,
                    username: user.username,
                    attempts: attempts
                })
            });
            const result = await response.json();
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
                <div className="flex justify-center gap-4 md:gap-8 mb-12 flex-wrap">
                    <button
                        onClick={() => setActiveGame('brick')}
                        className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeGame === 'brick'
                            ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                            : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {t('game.brick_breaker')}
                    </button>
                    <button
                        onClick={() => setActiveGame('match3')}
                        className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeGame === 'match3'
                            ? 'bg-fuchsia-500 text-black shadow-[0_0_20px_rgba(217,70,239,0.5)]'
                            : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {t('game.match3')}
                    </button>
                    <button
                        onClick={() => setActiveGame('pokemon')}
                        className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeGame === 'pokemon'
                            ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]'
                            : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {t('game.pokemon_quiz')}
                    </button>
                    <button
                        onClick={() => setActiveGame('maze')}
                        className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeGame === 'maze'
                            ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                            : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {t('game.maze')}
                    </button>
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
                <div className={`relative w-full max-w-5xl mx-auto ${activeGame === 'pokemon' ? 'min-h-[600px]' : activeGame === 'maze' ? 'min-h-[600px] md:aspect-auto' : 'min-h-[500px] md:min-h-0 md:aspect-video'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeGame}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                        >
                            {activeGame === 'brick' ? (
                                <BrickBreaker isDarkMode={isDarkMode} onSubmitScore={submitScore} personalBest={personalBest} />
                            ) : activeGame === 'match3' ? (
                                <Match3 isDarkMode={isDarkMode} onSubmitScore={submitScore} personalBest={personalBest} />
                            ) : activeGame === 'pokemon' ? (
                                <PokemonGame isDarkMode={isDarkMode} onSubmitScore={submitScore} personalBest={personalBest} />
                            ) : (
                                <MazeGame isDarkMode={isDarkMode} onSubmitScore={submitScore} personalBest={personalBest} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
