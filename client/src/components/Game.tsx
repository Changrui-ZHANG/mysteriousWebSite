import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import BrickBreaker from './games/BrickBreaker';
import Match3 from './games/Match3';
import PokemonGame from './games/PokemonGame';

interface GameProps {
    isDarkMode: boolean;
}

export function Game({ isDarkMode }: GameProps) {
    const { t } = useTranslation();
    const [activeGame, setActiveGame] = useState<'brick' | 'match3' | 'pokemon'>('brick');

    return (
        <div className={`min-h-screen pt-24 pb-12 px-4 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                        {t('game.arcade_zone')}
                    </h1>
                    <p className="text-xl opacity-70 font-serif italic">
                        {t('game.choose_your_challenge')}
                    </p>
                </motion.div>

                {/* Game Selector Tabs */}
                <div className="flex justify-center gap-8 mb-12">
                    <button
                        onClick={() => setActiveGame('brick')}
                        className={`px-8 py-3 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeGame === 'brick'
                            ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                            : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {t('game.brick_breaker')}
                    </button>
                    <button
                        onClick={() => setActiveGame('match3')}
                        className={`px-8 py-3 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeGame === 'match3'
                            ? 'bg-fuchsia-500 text-black shadow-[0_0_20px_rgba(217,70,239,0.5)]'
                            : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {t('game.match3')}
                    </button>
                    <button
                        onClick={() => setActiveGame('pokemon')}
                        className={`px-8 py-3 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 ${activeGame === 'pokemon'
                            ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]'
                            : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {t('game.pokemon_quiz')}
                    </button>
                </div>

                {/* Game Container */}
                <div className={`relative w-full max-w-5xl mx-auto ${activeGame === 'pokemon' ? 'min-h-[600px]' : 'aspect-video'}`}>
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
                                <BrickBreaker isDarkMode={isDarkMode} />
                            ) : activeGame === 'match3' ? (
                                <Match3 isDarkMode={isDarkMode} />
                            ) : (
                                <PokemonGame isDarkMode={isDarkMode} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
