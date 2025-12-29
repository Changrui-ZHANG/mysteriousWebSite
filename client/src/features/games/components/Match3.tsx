/**
 * Match3 - Candy crush style matching game
 * Refactored to use useMatch3 hook and sub-components
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaQuestion, FaExpand, FaCompress, FaRedo } from 'react-icons/fa';
import { useSound } from '../../../hooks/useSound';
import { useBGM } from '../../../hooks/useBGM';
import { useBGMVolume } from '../../../hooks/useBGMVolume';
import { useTheme } from '../../../hooks/useTheme';
import { useMute } from '../../../hooks/useMute';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { Button } from '../../../components';
import ElasticSlider from '../../../components/ui/ElasticSlider/ElasticSlider';
import { useMatch3 } from '../hooks/useMatch3';
import { Match3Rules, AUDIO_CONFIG } from './match3/index';

interface Match3Props {
    isDarkMode: boolean;
    onSubmitScore: (score: number) => void;
    personalBest?: { score: number } | null;
    isAuthenticated: boolean;
    onGameStart?: () => void;
}

export default function Match3({ isDarkMode, onSubmitScore, personalBest, isAuthenticated, onGameStart }: Match3Props) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);
    const { volume, setVolume } = useBGMVolume(0.4);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isFullScreen, toggleFullScreen } = useFullScreen(containerRef);
    const [isFlipped, setIsFlipped] = useState(false);

    const { board, score, selectedCandies, comboMultiplier, handleClick, resetGame, createBoard } = useMatch3({
        onSubmitScore, isAuthenticated, onGameStart, playSound,
    });

    useBGM(AUDIO_CONFIG.BGM_URL, !isMuted && !isFlipped, volume);

    return (
        <div ref={containerRef} className={`w-full h-full flex flex-col ${isFullScreen ? 'bg-slate-900 overflow-auto py-8' : ''}`} style={{ perspective: '1000px' }}>
            {/* Global Controls */}
            <div className="flex justify-end items-center gap-2 p-2 bg-black/40 backdrop-blur-md border-b border-white/10 z-[100] rounded-t-xl mx-4 mt-4">
                <div className="w-32 mr-2 flex items-center">
                    <ElasticSlider defaultValue={volume * 100} onChange={(v) => setVolume(v / 100)} color="pink" isMuted={isMuted} onToggleMute={toggleMute} />
                </div>
                <button onClick={(e) => { e.stopPropagation(); createBoard(); playSound('click'); }} className="text-yellow-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={t('game.reset')}>
                    <FaRedo size={18} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} className="text-pink-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={isFullScreen ? t('game.fullscreen_exit') : t('game.fullscreen')}>
                    {isFullScreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(prev => !prev); }} className="text-pink-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={t('game.help_rules')}>
                    <FaQuestion size={18} />
                </button>
            </div>

            <motion.div className="flex-1 w-full h-full relative" animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d' }}>
                {/* Front Face (Game) */}
                <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center border border-white/20 rounded-xl backdrop-blur-md transition-colors duration-500 overflow-hidden ${theme.bgCard} p-4`} style={{ backfaceVisibility: 'hidden' }}>
                    <div className="w-full flex justify-between items-center px-4 mb-4 md:px-8">
                        <div className="flex gap-4 items-center">
                            <div className="text-xl font-bold font-mono text-fuchsia-400 flex items-center">
                                {t('game.score')}: {score}
                                {comboMultiplier > 1 && <span className="ml-2 text-yellow-400 font-black animate-pulse text-xl md:text-2xl">{t('game.combos')} x{comboMultiplier}</span>}
                                {personalBest?.score !== undefined && <span className="ml-3 text-lg text-purple-400 opacity-80">({t('game.best')}: {Math.max(score, personalBest.score)})</span>}
                            </div>
                        </div>
                        <Button onClick={resetGame} variant="ghost" size="sm" rounded="full">{t('game.reset')}</Button>
                    </div>

                    <div className="w-full max-w-[400px] grid grid-cols-8 gap-0.5 md:gap-1 p-2 md:p-4 bg-black/40 rounded-lg mx-auto">
                        <AnimatePresence mode='popLayout'>
                            {board.map((candyColor, index) => (
                                <motion.div
                                    key={`${index}-${candyColor}`}
                                    layout={false}
                                    initial={{ y: -20, opacity: 0, scale: 0.8 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`w-full aspect-square rounded-md md:rounded-lg cursor-pointer ${candyColor ? 'shadow-lg z-10 candy-shadow' : 'invisible z-0'} ${candyColor} ${selectedCandies.includes(index) ? 'ring-2 md:ring-4 ring-white' : ''}`}
                                    onClick={() => handleClick(index)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                    <p className="mt-4 text-white/60 text-sm">{t('game.match3_desc')}</p>
                </div>

                {/* Back Face (Rules) */}
                <Match3Rules bgCard={theme.bgCard} onClose={() => setIsFlipped(false)} />
            </motion.div>
        </div>
    );
}
