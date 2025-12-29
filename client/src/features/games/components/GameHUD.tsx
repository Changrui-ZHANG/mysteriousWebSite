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
        <div className={`flex justify-between items-center w-full ${compact ? 'px-3 py-0.5' : 'px-4 py-3'} bg-white/5 backdrop-blur-md border-b border-white/10 transition-colors hover:bg-white/10`}>
            {/* Left: Score & Info */}
            <div className="flex flex-col gap-0.5">
                <div className={`${compact ? 'text-base' : 'text-xl'} font-bold font-mono ${colors.text} flex items-center gap-2 flex-wrap leading-tight`}>
                    <span>{t('game.score')}: {scoreDisplay}</span>
                    {showBest && (
                        <span className={`${compact ? 'text-xs' : 'text-base'} ${colors.best} opacity-80`}>
                            ({t('game.best')}: {Math.max(score, bestScore)})
                        </span>
                    )}
                </div>
                {customInfo && (
                    <div className={`${compact ? 'text-[10px]' : 'text-sm'} text-white/50 flex items-center gap-3 flex-wrap`}>
                        {customInfo}
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            {rightContent && (
                <div className="flex items-center gap-2">
                    {rightContent}
                </div>
            )}
        </div>
    );
}

/** Helper component for custom info items */
export function HUDItem({ icon, label, value, color }: { icon?: ReactNode; label?: string; value: ReactNode; color?: string }) {
    return (
        <span className={`flex items-center gap-1 ${color || 'text-white/60'}`}>
            {icon}
            {label && <span>{label}:</span>}
            <span className="font-mono font-bold">{value}</span>
        </span>
    );
}

export type { GameHUDProps, AccentColor };
