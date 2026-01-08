/**
 * GameHUD - Unified heads-up display for all games
 * Displays score, personal best, and custom game info in a consistent layout
 */

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type AccentColor = 'cyan' | 'pink' | 'purple' | 'yellow' | 'green';

interface GameHUDProps {
    /** Current score */
    score: number;
    /** Total attempts (for score/attempts display) */
    attempts?: number;
    /** Personal best record */
    personalBest?: { score: number; attempts?: number } | null;
    /** Accent color */
    color?: AccentColor;
    /** Custom info items to display below score */
    customInfo?: ReactNode;
    /** Right side content (buttons, etc.) */
    rightContent?: ReactNode;
    /** Show as compact (for smaller games) */
    compact?: boolean;
}

const COLOR_CLASSES: Record<AccentColor, { text: string; best: string }> = {
    cyan: { text: 'text-cyan-400', best: 'text-yellow-500/80' },
    pink: { text: 'text-fuchsia-400', best: 'text-purple-400' },
    purple: { text: 'text-purple-400', best: 'text-indigo-400' },
    yellow: { text: 'text-yellow-400', best: 'text-orange-400' },
    green: { text: 'text-green-400', best: 'text-emerald-400' },
};

export function GameHUD({
    score,
    attempts,
    personalBest,
    color = 'cyan',
    customInfo,
    rightContent,
    compact = false,
}: GameHUDProps) {
    const { t } = useTranslation();
    const colors = COLOR_CLASSES[color];

    const scoreDisplay = attempts !== undefined ? `${score}/${attempts}` : score;
    const bestScore = personalBest?.score ?? 0;
    const showBest = bestScore > 0;

    return (
        <div className={`relative flex justify-between items-center w-full ${compact ? 'px-3 md:px-4 py-2' : 'px-4 md:px-6 py-3 md:py-4'} bg-gradient-to-r from-slate-900/90 via-gray-900/95 to-slate-900/90 dark:from-gray-950/90 dark:via-black/95 dark:to-gray-950/90 backdrop-blur-xl border-b border-purple-400/30 dark:border-purple-500/20 transition-all duration-300 hover:from-slate-800/90 hover:via-gray-800/95 hover:to-slate-800/90 dark:hover:from-gray-900/90 dark:hover:via-gray-950/95 dark:hover:to-gray-900/90 shadow-[0_0_15px_rgba(124,58,237,0.1)]`}>
            {/* Sci-Fi Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"></div>
            
            {/* Left: Score & Info */}
            <div className="flex flex-col gap-1 relative z-10">
                <div className={`${compact ? 'text-sm md:text-base' : 'text-base md:text-xl'} font-bold font-mono ${colors.text} flex items-center gap-2 md:gap-3 flex-wrap leading-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]`}>
                    <span className="text-cyan-300 dark:text-cyan-400">{t('game.score')}: {scoreDisplay}</span>
                    {showBest && (
                        <span className={`${compact ? 'text-xs md:text-sm' : 'text-sm md:text-base'} ${colors.best} opacity-90 drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]`}>
                            ({t('game.best')}: {Math.max(score, bestScore)})
                        </span>
                    )}
                </div>
                {customInfo && (
                    <div className={`${compact ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'} text-purple-300 dark:text-purple-400 flex items-center gap-2 md:gap-3 flex-wrap drop-shadow-sm opacity-80`}>
                        {customInfo}
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            {rightContent && (
                <div className="flex items-center gap-1 md:gap-2 relative z-10">
                    {rightContent}
                </div>
            )}
        </div>
    );
}

/** Helper component for custom info items */
export function HUDItem({ icon, label, value, color }: { icon?: ReactNode; label?: string; value: ReactNode; color?: string }) {
    return (
        <span className={`flex items-center gap-1 ${color || 'text-purple-300 dark:text-purple-400'}`}>
            {icon}
            {label && <span>{label}:</span>}
            <span className="font-mono font-bold drop-shadow-[0_0_4px_rgba(168,85,247,0.3)]">{value}</span>
        </span>
    );
}

export type { GameHUDProps, AccentColor };
