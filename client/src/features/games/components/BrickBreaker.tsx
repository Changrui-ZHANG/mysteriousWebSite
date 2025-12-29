/**
 * BrickBreaker - Main brick breaker game component
 * Refactored to use hooks and sub-components
 */

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaQuestion, FaExpand, FaCompress, FaRedo } from 'react-icons/fa';
import { useSound } from '../../../hooks/useSound';
import { useBGM } from '../../../hooks/useBGM';
import { useTheme } from '../../../hooks/useTheme';
import { useMute } from '../../../hooks/useMute';
import { useBGMVolume } from '../../../hooks/useBGMVolume';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { ScoreDisplay } from '../../../components';
import ElasticSlider from '../../../components/ui/ElasticSlider/ElasticSlider';
import { useBrickBreaker } from '../hooks/useBrickBreaker';
import { useBrickBreakerEngine } from '../hooks/useBrickBreakerEngine';
import {
    MapSelector,
    BrickBreakerRules,
    BrickBreakerOverlay,
    AUDIO_CONFIG,
    LEVEL_CONFIG,
    PADDLE_CONFIG,
} from './brickbreaker/index';
import type { BrickBreakerProps } from './BrickBreakerProps';

export default function BrickBreaker({
    isDarkMode,
    onSubmitScore,
    personalBest,
    isAuthenticated,
    isAdmin = false,
    isSuperAdmin = false,
}: BrickBreakerProps) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);
    const { volume, setVolume } = useBGMVolume(0.4);
    const paddleWidthRef = useRef<number>(PADDLE_CONFIG.DEFAULT_WIDTH);

    const game = useBrickBreaker({ onSubmitScore, isAuthenticated, playSound });
    const { isFullScreen, toggleFullScreen } = useFullScreen(game.containerRef);

    useBGM(AUDIO_CONFIG.BGM_URL, !isMuted && game.gameState === 'playing', volume);

    useBrickBreakerEngine({
        canvasRef: game.canvasRef,
        containerRef: game.containerRef,
        paddleWidthRef,
        paddleWidthTimeoutRef: game.paddleWidthTimeoutRef,
        gameState: game.gameState,
        setGameState: game.setGameState,
        setPoints: game.setPoints,
        selectedMap: game.selectedMap,
        randomMapData: game.randomMapData,
        isDarkMode,
        playSound,
    });

    return (
        <div ref={game.containerRef} className={`relative w-full h-full flex flex-col ${isFullScreen ? 'bg-slate-900' : ''}`} style={{ perspective: '1000px' }}>
            {/* Global Controls */}
            <div className={`flex justify-end items-center gap-2 p-2 bg-black/40 backdrop-blur-md border border-white/10 z-[100] transition-all ${isFullScreen ? 'rounded-none border-x-0 border-t-0' : 'rounded-t-xl mx-4 mt-4'}`}>
                <div className="w-32 mr-2 flex items-center">
                    <ElasticSlider defaultValue={volume * 100} onChange={(v) => setVolume(v / 100)} color="cyan" isMuted={isMuted} onToggleMute={toggleMute} />
                </div>
                {game.gameState === 'playing' && (
                    <button onClick={(e) => { e.stopPropagation(); game.handleReset(); }} className="text-yellow-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={t('game.reset')}>
                        <FaRedo size={18} />
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={isFullScreen ? t('game.fullscreen_exit') : t('game.fullscreen')}>
                    {isFullScreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); game.setIsFlipped(prev => !prev); }} className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={t('game.help_rules')}>
                    <FaQuestion size={18} />
                </button>
            </div>

            <motion.div className="flex-1 w-full h-full relative" animate={{ rotateY: game.isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d' }}>
                {/* Front Face */}
                <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-all duration-500 ${theme.bgCard} ${isFullScreen ? 'rounded-none border-0' : 'border border-white/20 rounded-xl backdrop-blur-md overflow-hidden'}`} style={{ backfaceVisibility: 'hidden' }}>
                    <div className="absolute top-4 left-6 text-xl font-bold font-mono z-20 flex flex-col gap-1">
                        <ScoreDisplay score={game.score} attempts={LEVEL_CONFIG.LEVEL_COUNT} personalBest={personalBest} color="cyan" />
                        <div className="text-sm text-white/40 ml-1">Points: {game.points}</div>
                    </div>
                    <canvas ref={game.canvasRef} className="w-full h-full block touch-action-none" />
                    <BrickBreakerOverlay gameState={game.gameState} selectedMap={game.selectedMap} score={game.score} unlockedMaps={game.unlockedMaps} isLoadingMap={game.isLoadingMap} onShowMapSelector={() => game.setShowMapSelector(true)} onStartGame={() => game.handleStartGame()} onNextLevel={game.handleNextLevel} />
                </div>

                {/* Back Face */}
                <BrickBreakerRules bgCard={theme.bgCard} onClose={() => game.setIsFlipped(false)} />

                {/* Map Selector */}
                <MapSelector isOpen={game.showMapSelector} selectedMap={game.selectedMap} unlockedMaps={game.unlockedMaps} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} isLoadingMap={game.isLoadingMap} onSelectMap={game.setSelectedMap} onClose={() => game.setShowMapSelector(false)} onStartGame={() => game.handleStartGame()} playSound={playSound} />
            </motion.div>
        </div>
    );
}
