import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface PageContainerProps {
    isDarkMode: boolean;
    children: React.ReactNode;
    className?: string;
    centered?: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'w-full',
};

/**
 * Page container component
 * Provides consistent page structure with theme-aware styling
 */
export function PageContainer({
    isDarkMode,
    children,
    className = '',
    centered = false,
    maxWidth = 'full',
}: PageContainerProps) {
    const theme = useTheme(isDarkMode);

    const containerClasses = `
        ${theme.pageContainer}
        ${centered ? 'flex flex-col items-center justify-center' : ''}
        ${className}
    `;

    const innerClasses = maxWidth !== 'full'
        ? `${maxWidthClasses[maxWidth]} mx-auto w-full`
        : 'w-full';

    return (
        <div className={containerClasses}>
            <div className={innerClasses}>
                {children}
            </div>
        </div>
    );
}

export default PageContainer;
