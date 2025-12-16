import React from 'react';

type GradientType = 'purple-pink' | 'amber-orange' | 'cyan-purple' | 'cyan-blue' | 'green-teal';
type HeadingLevel = 1 | 2 | 3 | 4;

interface GradientHeadingProps {
    children: React.ReactNode;
    gradient?: GradientType;
    level?: HeadingLevel;
    className?: string;
}

const gradientClasses: Record<GradientType, string> = {
    'purple-pink': 'from-purple-400 to-pink-500',
    'amber-orange': 'from-amber-400 to-orange-500',
    'cyan-purple': 'from-cyan-400 to-purple-500',
    'cyan-blue': 'from-cyan-400 to-blue-500',
    'green-teal': 'from-green-400 to-teal-500',
};

const sizeClasses: Record<HeadingLevel, string> = {
    1: 'text-4xl md:text-5xl',
    2: 'text-3xl md:text-4xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
};

/**
 * Gradient heading component
 * Creates beautiful gradient text headings with configurable colors and sizes
 */
export function GradientHeading({
    children,
    gradient = 'purple-pink',
    level = 1,
    className = '',
}: GradientHeadingProps) {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const baseClasses = `
        font-bold font-heading 
        text-transparent bg-clip-text bg-gradient-to-r 
        ${gradientClasses[gradient]}
        ${sizeClasses[level]}
        leading-tight pb-2
        ${className}
    `;

    return React.createElement(Tag, { className: baseClasses }, children);
}

export default GradientHeading;
