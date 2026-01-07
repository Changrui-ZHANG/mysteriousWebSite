import React from 'react';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonColor = 'amber' | 'purple' | 'cyan' | 'blue' | 'red' | 'green' | 'gray';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonRounded = 'full' | 'lg' | 'md' | 'sm';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    rounded?: ButtonRounded;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

const roundedClasses: Record<ButtonRounded, string> = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    md: 'rounded-md',
    sm: 'rounded-sm',
};

const colorVariants: Record<ButtonColor, Record<ButtonVariant, string>> = {
    amber: {
        solid: 'bg-amber-500 text-white hover:bg-amber-600',
        outline: 'border-2 border-amber-500 text-amber-500 hover:bg-amber-500/10',
        ghost: 'text-amber-500 hover:bg-amber-500/10',
    },
    purple: {
        solid: 'bg-purple-600 text-white hover:bg-purple-500',
        outline: 'border-2 border-purple-500 text-purple-500 hover:bg-purple-500/10',
        ghost: 'text-purple-500 hover:bg-purple-500/10',
    },
    cyan: {
        solid: 'bg-cyan-600 text-white hover:bg-cyan-500',
        outline: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500/10',
        ghost: 'text-cyan-500 hover:bg-cyan-500/10',
    },
    blue: {
        solid: 'bg-blue-600 text-white hover:bg-blue-500',
        outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10',
        ghost: 'text-blue-500 hover:bg-blue-500/10',
    },
    red: {
        solid: 'bg-red-600 text-white hover:bg-red-500',
        outline: 'border-2 border-red-500 text-red-500 hover:bg-red-500/10',
        ghost: 'text-red-500 hover:bg-red-500/10',
    },
    green: {
        solid: 'bg-green-600 text-white hover:bg-green-500',
        outline: 'border-2 border-green-500 text-green-500 hover:bg-green-500/10',
        ghost: 'text-green-500 hover:bg-green-500/10',
    },
    gray: {
        solid: 'bg-gray-600 text-white hover:bg-gray-500',
        outline: 'border-2 border-gray-500 text-gray-500 hover:bg-gray-500/10',
        ghost: 'text-gray-500 hover:bg-gray-500/10',
    },
};

/**
 * Reusable button component with variants
 * Supports solid, outline, and ghost styles with multiple colors
 */
export function Button({
    children,
    variant = 'solid',
    color = 'purple',
    size = 'md',
    rounded = 'lg',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClasses = `
        inline-flex items-center justify-center gap-2
        font-bold transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${colorVariants[color][variant]}
        ${className}
    `;

    return (
        <button
            className={baseClasses}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
}

export default Button;
