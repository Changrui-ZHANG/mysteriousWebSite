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
    /** External ref for the actual game content area (for dimension measurements) */
    gameAreaRef?: React.RefObject<HTMLDivElement>;
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
    gameAreaRef,
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
            className={`relative w-full h-full flex flex-col min-w-0 max-w-full overflow-hidden ${isFullScreen ? fullscreenBg : ''}`}
        >
            {/* Main Container with responsive margins */}
            <div
                className={`flex-1 flex flex-col min-h-0 ${isFullScreen ? '' : 'mx-1 sm:mx-2 md:mx-4 mt-1 sm:mt-2 md:mt-4 mb-1 sm:mb-2 md:mb-4'}`}
                style={{ perspective: '1000px' }}
            >
                {/* Unified Header with Game Info and Controls */}
                <div className={`relative flex justify-between items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 bg-surface backdrop-blur-xl border-2 border-default transition-all duration-300 shadow-lg ${isFullScreen ? 'rounded-none border-x-0 border-t-0' : 'rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl'}`}>
                    {/* Sci-Fi Accent Effects */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-secondary/5 to-transparent opacity-50"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-info/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-secondary/30 to-transparent"></div>

                    {/* Left: Game Title and Status */}
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-[0_0_8px_${colors.glow}] ${gameStatus ? colors.primary.replace('text-', 'bg-') : 'bg-red-500'}`}></div>
                        <div className="flex flex-col">
                            <h2 className={`text-base sm:text-lg md:text-xl font-bold font-mono text-primary tracking-wider uppercase drop-shadow-sm`}>
                                {gameTitle}
                            </h2>
                            <span className="text-xs font-mono text-secondary opacity-90">
                                {gameStatus ? 'SYSTEM ACTIVE' : 'SYSTEM OFFLINE'}
                            </span>
                        </div>
                    </div>

                    {/* Center: Enhanced HUD Info with Personal Score Emphasis */}
                    {hud && (
                        <div className="hidden md:flex items-center gap-4 relative z-10">
                            <div className="flex items-center gap-4">
                                {/* Current Score with Enhanced Styling */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-surface-alt rounded-lg border border-default backdrop-blur-sm">
                                    <span className="text-xs font-mono text-secondary uppercase tracking-wider">SCORE</span>
                                    <span className={`text-lg font-mono font-black text-primary tracking-wider`}>
                                        {hud.attempts !== undefined ? `${hud.score}/${hud.attempts}` : hud.score}
                                    </span>
                                </div>

                                {/* Personal Best with Achievement Emphasis */}
                                {hud.personalBest && hud.personalBest.score > 0 && (
                                    <div className="relative">
                                        {/* Achievement Glow Effect */}
                                        <div className="absolute inset-0 achievement-glow rounded-lg blur-sm animate-pulse"></div>
                                        <div className="relative flex items-center gap-2 px-3 py-2 achievement-bg rounded-lg border-2 backdrop-blur-sm shadow-md">
                                            <span className="text-xs font-mono achievement-text-label uppercase tracking-wider font-bold">BEST</span>
                                            <span className="text-lg font-mono font-black achievement-text-score tracking-wider">
                                                {Math.max(hud.score, hud.personalBest.score)}
                                            </span>
                                            {/* Achievement Badge */}
                                            <div className="w-2 h-2 achievement-badge rounded-full animate-pulse shadow-sm"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {hud.customInfo && (
                                <div className="text-xs text-secondary font-mono">
                                    {hud.customInfo}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right: Controls */}
                    <div className="flex items-center gap-1 sm:gap-2 relative z-10">
                        {/* Volume Control */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-surface-alt rounded-lg border border-default backdrop-blur-sm">
                            <button
                                onClick={toggleMute}
                                className={`text-primary hover:text-secondary transition-colors p-1`}
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
                                className="group relative p-1.5 sm:p-2 md:p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-400/30 hover:to-orange-400/30 rounded-lg sm:rounded-xl border border-yellow-400/40 hover:border-yellow-300/60 transition-all duration-300 active:scale-95 backdrop-blur-sm shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] md:min-h-[44px] md:min-w-[44px]"
                                title={t('game.reset')}
                            >
                                <FaRedo size={14} className="text-yellow-400 group-hover:text-yellow-300 transition-colors sm:text-base" />
                            </button>
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                            className="group relative p-1.5 sm:p-2 md:p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 hover:from-purple-400/30 hover:to-indigo-400/30 rounded-lg sm:rounded-xl border border-purple-400/40 hover:border-purple-300/60 transition-all duration-300 active:scale-95 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] md:min-h-[44px] md:min-w-[44px]"
                            title={isFullScreen ? t('game.fullscreen_exit') : t('game.fullscreen')}
                        >
                            {isFullScreen ? (
                                <FaCompress size={14} className="text-purple-400 group-hover:text-purple-300 transition-colors sm:text-base" />
                            ) : (
                                <FaExpand size={14} className="text-purple-400 group-hover:text-purple-300 transition-colors sm:text-base" />
                            )}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleFlip(); }}
                            className="group relative p-1.5 sm:p-2 md:p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 hover:from-cyan-400/30 hover:to-blue-400/30 rounded-lg sm:rounded-xl border border-cyan-400/40 hover:border-cyan-300/60 transition-all duration-300 active:scale-95 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] md:min-h-[44px] md:min-w-[44px]"
                            title={t('game.help_rules')}
                        >
                            <FaQuestion size={16} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Flip Container */}
                <motion.div
                    className="flex-1 w-full relative"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face - Game Content */}
                    <div className={`${isFlipped ? 'hidden' : ''} w-full h-full flex flex-col transition-all duration-500 bg-surface backdrop-blur-xl max-w-full overflow-hidden ${isFullScreen ? 'rounded-none border-0' : `border-2 border-l-default border-r-default border-b-default ${borderClass} rounded-b-lg sm:rounded-b-xl md:rounded-b-2xl`} ${bgGradient || ''}`}>
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/2 via-transparent to-accent-info/2 pointer-events-none"></div>

                        {/* Mobile HUD with Enhanced Personal Score Display */}
                        {hud && (
                            <div className="md:hidden px-4 py-3 bg-surface-alt border-b border-default backdrop-blur-sm">
                                <div className="flex justify-between items-center">
                                    {/* Current Score */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-secondary uppercase tracking-wider">SCORE</span>
                                        <span className={`text-base font-mono font-black text-primary tracking-wider`}>
                                            {hud.attempts !== undefined ? `${hud.score}/${hud.attempts}` : hud.score}
                                        </span>
                                    </div>

                                    {/* Personal Best with Mobile Achievement Styling */}
                                    {hud.personalBest && hud.personalBest.score > 0 && (
                                        <div className="relative">
                                            <div className="absolute inset-0 achievement-glow rounded-md blur-sm animate-pulse"></div>
                                            <div className="relative flex items-center gap-2 px-2 py-1 achievement-bg rounded-md border backdrop-blur-sm">
                                                <span className="text-xs font-mono achievement-text-label uppercase tracking-wider font-bold">BEST</span>
                                                <span className="text-base font-mono font-black achievement-text-score tracking-wider">
                                                    {Math.max(hud.score, hud.personalBest.score)}
                                                </span>
                                                <div className="w-1.5 h-1.5 achievement-badge rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Game Content - Properly aligned and flexible */}
                        <div
                            ref={gameAreaRef as React.RefObject<HTMLDivElement>}
                            className="flex-1 relative w-full overflow-hidden"
                        >
                            {children}
                        </div>
                    </div>

                    {/* Back Face - Rules */}
                    <div className={`${isFlipped ? '' : 'hidden'} absolute inset-0 w-full h-full transition-all duration-500 bg-surface max-w-full overflow-hidden ${isFullScreen ? 'rounded-none border-0' : `border-2 border-l-accent-info/30 border-r-accent-info/30 border-b-accent-info/30 rounded-b-lg sm:rounded-b-xl backdrop-blur-xl`}`}>
                        {/* Inner glow effect for rules */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-info/5 via-transparent to-accent-secondary/5 pointer-events-none"></div>
                        {rulesContent}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
