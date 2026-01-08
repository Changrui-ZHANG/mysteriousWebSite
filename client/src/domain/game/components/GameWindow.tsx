/**
 * GameWindow - Unified game container with integrated HUD and controls
 * Single cohesive interface without redundant layers
 */

import { useRef, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaQuestion, FaExpand, FaCompress, FaRedo, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useMute } from '../../../shared/hooks/useMute';
import { useSound } from '../../../shared/hooks/useSound';
import { useBGM } from '../../../shared/hooks/useBGM';
import { useBGMVolume } from '../../../shared/hooks/useBGMVolume';
import { useFullScreen } from '../../../shared/hooks/useFullScreen';
import ElasticSlider from '../../../shared/components/ui/ElasticSlider/ElasticSlider';

type AccentColor = 'cyan' | 'pink' | 'purple' | 'yellow' | 'green';

interface HUDConfig {
    score: number;
    attempts?: number;
    personalBest?: { score: number; attempts?: number } | null;
    customInfo?: ReactNode;
    rightContent?: ReactNode;
    compact?: boolean;
}

interface GameWindowProps {
    /** Game content */
    children: ReactNode;
    /** Rules panel content */
    rulesContent: ReactNode;
    /** Game title */
    gameTitle: string;
    /** Accent color for buttons */
    color?: AccentColor;
    /** BGM URL */
    bgmUrl?: string;
    /** Called when reset button is clicked */
    onReset?: () => void;
    /** Show reset button */
    showReset?: boolean;
    /** Additional controls to render in the control bar */
    extraControls?: ReactNode;
    /** External ref for container */
    containerRef?: React.RefObject<HTMLDivElement>;
    /** Control BGM playback externally */
    bgmEnabled?: boolean;
    /** Callback when flip state changes */
    onFlipChange?: (isFlipped: boolean) => void;
    /** External flip state control */
    isFlipped?: boolean;
    /** Background class for fullscreen mode */
    fullscreenBg?: string;
    /** HUD configuration */
    hud?: HUDConfig;
    /** Background gradient class for game area */
    bgGradient?: string;
    /** Game status (enabled/disabled) */
    gameStatus?: boolean;
}

const COLOR_CLASSES: Record<AccentColor, { primary: string; secondary: string; glow: string }> = {
    cyan: { primary: 'text-cyan-400', secondary: 'text-cyan-300', glow: 'rgba(6,182,212,0.4)' },
    pink: { primary: 'text-fuchsia-400', secondary: 'text-fuchsia-300', glow: 'rgba(217,70,239,0.4)' },
    purple: { primary: 'text-purple-400', secondary: 'text-purple-300', glow: 'rgba(168,85,247,0.4)' },
    yellow: { primary: 'text-yellow-400', secondary: 'text-yellow-300', glow: 'rgba(234,179,8,0.4)' },
    green: { primary: 'text-emerald-400', secondary: 'text-emerald-300', glow: 'rgba(16,185,129,0.4)' },
};

const BORDER_CLASSES: Record<AccentColor, string> = {
    cyan: 'border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    pink: 'border-fuchsia-400/50 shadow-[0_0_30px_rgba(217,70,239,0.3)]',
    purple: 'border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    yellow: 'border-yellow-400/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]',
    green: 'border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]',
};

export function GameWindow({
    children,
    rulesContent,
    gameTitle,
    color = 'cyan',
    bgmUrl,
    onReset,
    showReset = true,
    extraControls,
    containerRef: externalRef,
    bgmEnabled = true,
    onFlipChange,
    isFlipped: externalFlipped,
    fullscreenBg = 'bg-slate-900',
    hud,
    bgGradient,
    gameStatus = true,
}: GameWindowProps) {
    const { t } = useTranslation();
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = externalRef || internalRef;
    const { isFullScreen, toggleFullScreen } = useFullScreen(containerRef);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);
    const { volume, setVolume } = useBGMVolume(0.4);

    const [internalFlipped, setInternalFlipped] = useState(false);
    const isFlipped = externalFlipped !== undefined ? externalFlipped : internalFlipped;

    const handleFlip = () => {
        const newValue = !isFlipped;
        if (externalFlipped === undefined) {
            setInternalFlipped(newValue);
        }
        onFlipChange?.(newValue);
    };

    useBGM(bgmUrl || '', !isMuted && bgmEnabled && !isFlipped, volume);

    const handleReset = () => {
        playSound('click');
        onReset?.();
    };

    const colors = COLOR_CLASSES[color];
    const borderClass = BORDER_CLASSES[color];

    return (
        <div
            ref={containerRef as React.RefObject<HTMLDivElement>}
            className={`relative w-full h-full flex flex-col ${isFullScreen ? fullscreenBg : ''}`}
            style={{ perspective: '1000px' }}
        >
            {/* Main Container with consistent margins */}
            <div className={`flex flex-col h-full ${isFullScreen ? '' : 'mx-2 md:mx-4 mt-2 md:mt-4 mb-2 md:mb-4'}`}>
                {/* Unified Header with Game Info and Controls */}
                <div className={`relative flex justify-between items-center gap-3 md:gap-4 p-4 md:p-5 bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-900/95 dark:from-gray-950/95 dark:via-black/95 dark:to-gray-950/95 backdrop-blur-xl border-2 border-purple-500/30 dark:border-purple-400/20 transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.15)] ${isFullScreen ? 'rounded-none border-x-0 border-t-0' : 'rounded-t-xl md:rounded-t-2xl'}`}>
                {/* Sci-Fi Accent Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-50"></div>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
                
                {/* Left: Game Title and Status */}
                <div className="flex items-center gap-3 md:gap-4 relative z-10">
                    <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_8px_${colors.glow}] ${gameStatus ? colors.primary.replace('text-', 'bg-') : 'bg-red-500'}`}></div>
                    <div className="flex flex-col">
                        <h2 className={`text-lg md:text-xl font-bold font-mono ${colors.primary} tracking-wider uppercase drop-shadow-[0_0_8px_${colors.glow}]`}>
                            {gameTitle}
                        </h2>
                        <span className="text-xs md:text-sm font-mono text-gray-300 dark:text-gray-400 opacity-90">
                            {gameStatus ? 'SYSTEM ACTIVE' : 'SYSTEM OFFLINE'}
                        </span>
                    </div>
                </div>

                {/* Center: Enhanced HUD Info with Personal Score Emphasis */}
                {hud && (
                    <div className="hidden md:flex items-center gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            {/* Current Score with Enhanced Styling */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 dark:bg-black/90 rounded-lg border border-purple-400/50 backdrop-blur-sm">
                                <span className="text-xs font-mono text-gray-300 dark:text-gray-400 uppercase tracking-wider">SCORE</span>
                                <span className={`text-lg font-mono font-black ${colors.primary} drop-shadow-[0_0_8px_${colors.glow}] tracking-wider`}>
                                    {hud.attempts !== undefined ? `${hud.score}/${hud.attempts}` : hud.score}
                                </span>
                            </div>
                            
                            {/* Personal Best with Achievement Emphasis */}
                            {hud.personalBest && hud.personalBest.score > 0 && (
                                <div className="relative">
                                    {/* Achievement Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/30 to-yellow-400/20 rounded-lg blur-sm animate-pulse"></div>
                                    <div className="relative flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-900/80 via-orange-900/80 to-yellow-900/80 dark:from-yellow-800/90 dark:via-orange-800/90 dark:to-yellow-800/90 rounded-lg border-2 border-yellow-400/70 backdrop-blur-sm shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                                        <span className="text-xs font-mono text-yellow-200 uppercase tracking-wider font-bold">BEST</span>
                                        <span className="text-lg font-mono font-black text-yellow-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)] tracking-wider">
                                            {Math.max(hud.score, hud.personalBest.score)}
                                        </span>
                                        {/* Achievement Badge */}
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(234,179,8,0.8)]"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {hud.customInfo && (
                            <div className="text-xs text-gray-300 dark:text-gray-400 font-mono">
                                {hud.customInfo}
                            </div>
                        )}
                    </div>
                )}

                {/* Right: Controls */}
                <div className="flex items-center gap-2 relative z-10">
                    {/* Volume Control */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/80 dark:bg-black/80 rounded-lg border border-purple-400/40 dark:border-purple-500/30 backdrop-blur-sm">
                        <button
                            onClick={toggleMute}
                            className={`${colors.primary} hover:${colors.secondary} transition-colors p-1`}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                        </button>
                        <div className="w-32 md:w-40 flex items-center">
                            <ElasticSlider 
                                defaultValue={volume * 100} 
                                onChange={(v) => setVolume(v / 100)} 
                                color={color} 
                                isMuted={isMuted} 
                                onToggleMute={toggleMute} 
                            />
                        </div>
                    </div>
                    
                    {extraControls}
                    
                    {/* Action Buttons */}
                    {showReset && onReset && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleReset(); }} 
                            className="group relative p-2 md:p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-400/30 hover:to-orange-400/30 rounded-xl border border-yellow-400/40 hover:border-yellow-300/60 transition-all duration-300 active:scale-95 backdrop-blur-sm shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] min-h-[44px] min-w-[44px]" 
                            title={t('game.reset')}
                        >
                            <FaRedo size={16} className="text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                        </button>
                    )}
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} 
                        className="group relative p-2 md:p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 hover:from-purple-400/30 hover:to-indigo-400/30 rounded-xl border border-purple-400/40 hover:border-purple-300/60 transition-all duration-300 active:scale-95 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] min-h-[44px] min-w-[44px]" 
                        title={isFullScreen ? t('game.fullscreen_exit') : t('game.fullscreen')}
                    >
                        {isFullScreen ? (
                            <FaCompress size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                        ) : (
                            <FaExpand size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                        )}
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleFlip(); }} 
                        className="group relative p-2 md:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 hover:from-cyan-400/30 hover:to-blue-400/30 rounded-xl border border-cyan-400/40 hover:border-cyan-300/60 transition-all duration-300 active:scale-95 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] min-h-[44px] min-w-[44px]" 
                        title={t('game.help_rules')}
                    >
                        <FaQuestion size={16} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                    </button>
                </div>
            </div>

            {/* Flip Container */}
            <motion.div 
                className="flex-1 w-full h-full relative" 
                animate={{ rotateY: isFlipped ? 180 : 0 }} 
                transition={{ duration: 0.6 }} 
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Face - Game Content */}
                <div className={`absolute inset-0 w-full h-full flex flex-col transition-all duration-500 bg-gradient-to-br from-slate-900/95 via-gray-900/90 to-slate-800/95 dark:from-gray-950/95 dark:via-black/90 dark:to-gray-900/95 backdrop-blur-xl ${isFullScreen ? 'rounded-none border-0' : `border-2 border-l-purple-500/30 border-r-purple-500/30 border-b-purple-500/30 dark:border-l-purple-400/20 dark:border-r-purple-400/20 dark:border-b-purple-400/20 ${borderClass} rounded-b-xl md:rounded-b-2xl overflow-hidden`} ${bgGradient || ''}`} style={{ backfaceVisibility: 'hidden' }}>
                    {/* Inner glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
                    
                    {/* Mobile HUD with Enhanced Personal Score Display */}
                    {hud && (
                        <div className="md:hidden px-4 py-3 bg-slate-800/90 dark:bg-black/90 border-b border-purple-400/30 backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                                {/* Current Score */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">SCORE</span>
                                    <span className={`text-base font-mono font-black ${colors.primary} drop-shadow-[0_0_6px_${colors.glow}] tracking-wider`}>
                                        {hud.attempts !== undefined ? `${hud.score}/${hud.attempts}` : hud.score}
                                    </span>
                                </div>
                                
                                {/* Personal Best with Mobile Achievement Styling */}
                                {hud.personalBest && hud.personalBest.score > 0 && (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-yellow-400/20 rounded-md blur-sm animate-pulse"></div>
                                        <div className="relative flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-yellow-900/80 to-orange-900/80 dark:from-yellow-800/90 dark:to-orange-800/90 rounded-md border border-yellow-400/70 backdrop-blur-sm">
                                            <span className="text-xs font-mono text-yellow-200 uppercase tracking-wider font-bold">BEST</span>
                                            <span className="text-base font-mono font-black text-yellow-300 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)] tracking-wider">
                                                {Math.max(hud.score, hud.personalBest.score)}
                                            </span>
                                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Game Content - Properly aligned and flexible */}
                    <div className="flex-1 relative w-full min-h-0 overflow-hidden">
                        {children}
                    </div>
                </div>

                {/* Back Face - Rules */}
                <div className={`absolute inset-0 w-full h-full transition-all duration-500 bg-gradient-to-br from-slate-900/95 via-gray-900/90 to-slate-800/95 dark:from-gray-950/95 dark:via-black/90 dark:to-gray-900/95 ${isFullScreen ? 'rounded-none border-0' : `border-2 border-l-cyan-400/30 border-r-cyan-400/30 border-b-cyan-400/30 dark:border-l-cyan-500/20 dark:border-r-cyan-500/20 dark:border-b-cyan-500/20 rounded-b-xl backdrop-blur-xl overflow-hidden`}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    {/* Inner glow effect for rules */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                    {rulesContent}
                </div>
            </motion.div>
            </div>
        </div>
    );
}
