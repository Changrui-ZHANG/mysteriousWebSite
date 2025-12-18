import React from 'react';

type IconButtonVariant = 'ghost' | 'circle' | 'solid';
type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonColor = 'default' | 'cyan' | 'purple' | 'amber' | 'red' | 'white';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
    color?: IconButtonColor;
    title?: string;
}

const sizeClasses: Record<IconButtonSize, { button: string; icon: string }> = {
    sm: { button: 'p-1.5', icon: 'text-sm' },
    md: { button: 'p-2', icon: 'text-lg' },
    lg: { button: 'p-3', icon: 'text-xl' },
};

const variantClasses: Record<IconButtonVariant, string> = {
    ghost: 'hover:bg-white/10 rounded-full',
    circle: 'rounded-full border border-white/20 hover:bg-white/10',
    solid: 'rounded-lg bg-white/10 hover:bg-white/20',
};

const colorClasses: Record<IconButtonColor, string> = {
    default: 'text-white/70 hover:text-white',
    cyan: 'text-cyan-400 hover:text-cyan-300',
    purple: 'text-purple-400 hover:text-purple-300',
    amber: 'text-amber-400 hover:text-amber-300',
    red: 'text-red-400 hover:text-red-300',
    white: 'text-white hover:text-white/80',
};

/**
 * Reusable icon button component with multiple variants and sizes.
 * Used for action buttons like mute, help, close, navigation, etc.
 */
export function IconButton({
    icon,
    variant = 'ghost',
    size = 'md',
    color = 'default',
    title,
    className = '',
    ...props
}: IconButtonProps) {
    const classes = `
        ${sizeClasses[size].button}
        ${variantClasses[variant]}
        ${colorClasses[color]}
        transition-colors duration-200
        flex items-center justify-center
        ${className}
    `.trim();

    return (
        <button
            className={classes}
            title={title}
            {...props}
        >
            <span className={sizeClasses[size].icon}>{icon}</span>
        </button>
    );
}
