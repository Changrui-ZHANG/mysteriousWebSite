/**
 * GameWindow - Reusable game window container with flip animation
 * Provides: controls bar, HUD, fullscreen, flip to rules, volume slider
 */

import { useRef, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaQuestion, FaExpand, FaCompress, FaRedo } from 'react-icons/fa';
import { useMute } from '../../../hooks/useMute';
import { useSound } from '../../../hooks/useSound';
import { useBGM } from '../../../hooks/useBGM';
import { useBGMVolume } from '../../../hooks/useBGMVolume';
import { useFullScreen } from '../../../hooks/useFullScreen';
import ElasticSlider from '../../../components/ui/ElasticSlider/ElasticSlider';
import { GameHUD } from './GameHUD';

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
    /** Game content (front face) */
    children: ReactNode;
    /** Rules panel content (back face) */
    rulesContent: ReactNode;
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
    /** External ref for container (for games that need it) */
    containerRef?: React.RefObject<HTMLDivElement>;
    /** Control BGM playback externally */
    bgmEnabled?: boolean;
    /** Callback when flip state changes */
    onFlipChange?: (isFlipped: boolean) => void;
    /** External flip state control */
    isFlipped?: boolean;
    /** Background class for fullscreen mode */
    fullscreenBg?: string;
    /** HUD configuration - if provided, displays unified HUD */
    hud?: HUDConfig;
    /** Background gradient class for game area */
    bgGradient?: string;
}

const COLOR_CLASSES: Record<AccentColor, string> = {
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
};

const BORDER_CLASSES: Record<AccentColor, string> = {
    cyan: 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    pink: 'border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)]',
    purple: 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    yellow: 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.15)]',
    green: 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
};

export function GameWindow({
    children,
    rulesContent,
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

    const accentClass = COLOR_CLASSES[color];
    const borderClass = BORDER_CLASSES[color];

    return (
        <div
            ref={containerRef as React.RefObject<HTMLDivElement>}
            className={`relative w-full h-full flex flex-col ${isFullScreen ? fullscreenBg : ''}`}
            style={{ perspective: '1000px' }}
        >
            {/* Control Bar */}
            <div className={`flex justify-end items-center gap-2 p-2 bg-black/40 backdrop-blur-md border border-white/10 z-[100] transition-all ${isFullScreen ? 'rounded-none border-x-0 border-t-0' : 'rounded-t-xl mx-4 mt-4'}`}>
                <div className="w-32 mr-2 flex items-center">
                    <ElasticSlider defaultValue={volume * 100} onChange={(v) => setVolume(v / 100)} color={color} isMuted={isMuted} onToggleMute={toggleMute} />
                </div>
                {extraControls}
                {showReset && onReset && (
                    <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="text-yellow-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={t('game.reset')}>
                        <FaRedo size={18} />
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} className={`${accentClass} p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95`} title={isFullScreen ? t('game.fullscreen_exit') : t('game.fullscreen')}>
                    {isFullScreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleFlip(); }} className={`${accentClass} p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95`} title={t('game.help_rules')}>
                    <FaQuestion size={18} />
                </button>
            </div>

            {/* Flip Container */}
            <motion.div className="flex-1 w-full h-full relative" animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d' }}>
                {/* Front Face - Game Content */}
                <div className={`absolute inset-0 w-full h-full flex flex-col transition-all duration-500 ${isFullScreen ? 'rounded-none border-0' : `border ${borderClass} rounded-xl backdrop-blur-md overflow-hidden`} ${bgGradient || ''}`} style={{ backfaceVisibility: 'hidden' }}>
                    {hud && (
                        <GameHUD
                            score={hud.score}
                            attempts={hud.attempts}
                            personalBest={hud.personalBest}
                            color={color}
                            customInfo={hud.customInfo}
                            rightContent={hud.rightContent}
                            compact={hud.compact}
                        />
                    )}
                    <div className="flex-1 relative overflow-hidden">
                        {children}
                    </div>
                </div>

                {/* Back Face - Rules */}
                <div className={`absolute inset-0 w-full h-full transition-all duration-500 ${isFullScreen ? 'rounded-none border-0' : `border ${borderClass} rounded-xl backdrop-blur-md overflow-hidden`}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    {rulesContent}
                </div>
            </motion.div>
        </div>
    );
}

export { GameHUD, HUDItem } from './GameHUD';
export type { GameWindowProps, AccentColor, HUDConfig };
