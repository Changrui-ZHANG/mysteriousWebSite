/**
 * StatCard - Reusable component for displaying statistics
 * Displays a statistic with optional icon, trend indicator, and click handler
 * Adapted for Glassmorphism design with Tailwind v4 syntax
 */

import React from 'react';

export interface StatCardProps {
    /** Label for the statistic */
    label: string;
    /** Value to display (can be string or number) */
    value: string | number;
    /** Optional icon to display */
    icon?: React.ReactNode;
    /** Optional trend indicator */
    trend?: {
        /** Trend value (e.g., percentage) */
        value: number;
        /** Direction of the trend */
        direction: 'up' | 'down';
    };
    /** Optional click handler (makes card interactive) */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * StatCard component
 * Displays a statistic in a glass-morphism card with optional trend and icon
 * 
 * @example
 * ```tsx
 * <StatCard
 *   label="Games Played"
 *   value={42}
 *   icon={<GameIcon />}
 *   trend={{ value: 12, direction: 'up' }}
 *   onClick={() => console.log('Clicked')}
 * />
 * ```
 */
export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon,
    trend,
    onClick,
    className = ''
}) => {
    const isInteractive = !!onClick;

    return (
        <div
            className={`
                p-4 rounded-lg bg-(--bg-surface) border border-(--border-primary)
                transition-all duration-200
                ${isInteractive ? 'cursor-pointer hover:bg-(--bg-hover) hover:shadow-lg hover:scale-105' : ''}
                ${className}
            `}
            onClick={onClick}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onKeyDown={isInteractive ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            } : undefined}
        >
            {/* Header with label and icon */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-(--text-secondary) text-sm font-medium">
                    {label}
                </span>
                {icon && (
                    <span className="text-(--accent-primary)">
                        {icon}
                    </span>
                )}
            </div>

            {/* Value and trend */}
            <div className="flex items-end justify-between">
                <span className="text-(--text-primary) text-2xl font-bold">
                    {value}
                </span>
                {trend && (
                    <span
                        className={`text-sm font-medium ${
                            trend.direction === 'up'
                                ? 'text-green-500'
                                : 'text-red-500'
                        }`}
                        aria-label={`Trend ${trend.direction} by ${trend.value}%`}
                    >
                        {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
                    </span>
                )}
            </div>
        </div>
    );
};
