import { useMemo } from 'react';

interface ThemeClasses {
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Background colors
    bgPage: string;
    bgCard: string;
    bgCardHover: string;

    // Border colors
    borderColor: string;
    borderColorAccent: string;

    // Composite classes
    pageContainer: string;
    glassCard: (accentColor?: 'purple' | 'cyan' | 'amber' | 'blue' | 'green') => string;
}

/**
 * Hook to get theme-aware CSS classes
 * Centralizes all theme-based styling decisions
 */
export function useTheme(isDarkMode: boolean): ThemeClasses {
    return useMemo(() => {
        const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
        const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-700';
        const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-400';

        const bgPage = isDarkMode ? 'bg-dark' : 'bg-light';
        const bgCard = isDarkMode ? 'bg-black/60' : 'bg-white/80';
        const bgCardHover = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5';

        const borderColor = isDarkMode ? 'border-white/10' : 'border-black/10';

        const accentColors = {
            purple: isDarkMode ? 'border-purple-500/30' : 'border-purple-500/20',
            cyan: isDarkMode ? 'border-cyan-500/30' : 'border-cyan-500/20',
            amber: isDarkMode ? 'border-amber-500/30' : 'border-amber-500/20',
            blue: isDarkMode ? 'border-blue-500/30' : 'border-blue-500/20',
            green: isDarkMode ? 'border-green-500/30' : 'border-green-500/20',
        };

        return {
            textPrimary,
            textSecondary,
            textMuted,
            bgPage,
            bgCard,
            bgCardHover,
            borderColor,
            borderColorAccent: accentColors.purple,

            pageContainer: `min-h-screen pt-24 pb-12 px-4 transition-colors duration-500 ${bgPage} ${textPrimary}`,

            glassCard: (accentColor: 'purple' | 'cyan' | 'amber' | 'blue' | 'green' = 'purple') =>
                `p-6 rounded-xl backdrop-blur-md border ${bgCard} ${accentColors[accentColor]}`,
        };
    }, [isDarkMode]);
}

export default useTheme;
