/**
 * CharacterCounter - Reusable character counter component
 * Displays character count with color coding for warning/error states
 * Adapted for Glassmorphism design with Tailwind v4 syntax
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface CharacterCounterProps {
    /** Current character count */
    current: number;
    /** Maximum character count */
    max: number;
    /** Warning threshold (default: 90% of max) */
    warning?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * CharacterCounter component
 * Displays character count with visual feedback based on usage
 * 
 * @example
 * ```tsx
 * <CharacterCounter
 *   current={displayName.length}
 *   max={30}
 *   warning={27}
 * />
 * ```
 */
export const CharacterCounter: React.FC<CharacterCounterProps> = ({
    current,
    max,
    warning = max * 0.9,
    className = ''
}) => {
    const { t } = useTranslation();
    const isWarning = current >= warning;
    const isError = current > max;

    const getColorClass = () => {
        if (isError) return 'text-red-500';
        if (isWarning) return 'text-yellow-500';
        return 'text-(--text-secondary)';
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span
                className={`text-sm font-medium ${getColorClass()}`}
                aria-live="polite"
                aria-label={`${current} of ${max} characters used`}
            >
                {current} / {max}
            </span>
            {isError && (
                <span
                    className="text-red-500 text-xs font-medium"
                    role="alert"
                >
                    {t('profile.form.limit_exceeded') || 'Limite dépassée'}
                </span>
            )}
        </div>
    );
};
