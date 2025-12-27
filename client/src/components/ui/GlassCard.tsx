import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

type AccentColor = 'purple' | 'cyan' | 'amber' | 'blue' | 'green';

interface GlassCardProps extends MotionProps {
    isDarkMode: boolean;
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

/**
 * Glass-effect card component (glassmorphism)
 * Reusable card with backdrop blur, configurable accent colors
 */
export function GlassCard({
    isDarkMode,
    children,
    accentColor = 'purple',
    className = '',
    padding = 'md',
    animated = true,
    onClick,
    ...motionProps
}: GlassCardProps) {
    const theme = useTheme(isDarkMode);

    const cardClasses = `
        ${theme.glassCard(accentColor)}
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
