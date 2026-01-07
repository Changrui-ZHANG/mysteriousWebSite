import React from 'react';
import { motion, MotionProps } from 'framer-motion';


type AccentColor = 'purple' | 'cyan' | 'amber' | 'blue' | 'green';

interface GlassCardProps extends MotionProps {
    children: React.ReactNode;
    accentColor?: AccentColor;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    animated?: boolean;
    onClick?: () => void;
}

const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
};

const accentColorMap: Record<AccentColor, string> = {
    purple: 'glass-card--secondary',
    cyan: 'glass-card--info',
    amber: 'glass-card--warning',
    blue: 'glass-card--primary',
    green: 'glass-card--success',
};

/**
 * Glass-effect card component (glassmorphism)
 * Reusable card with backdrop blur, configurable accent colors
 */
export function GlassCard({
    children,
    accentColor = 'purple',
    className = '',
    padding = 'md',
    animated = true,
    onClick,
    ...motionProps
}: GlassCardProps) {
    const cardClasses = `
        glass-panel
        ${accentColorMap[accentColor]}
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
    `;

    if (animated) {
        return (
            <motion.div
                className={cardClasses}
                onClick={onClick}
                {...motionProps}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={cardClasses} onClick={onClick}>
            {children}
        </div>
    );
}

export default GlassCard;
