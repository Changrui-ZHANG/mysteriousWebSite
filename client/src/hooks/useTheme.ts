/**
 * @deprecated Use useThemeManager instead for full theme management.
 * This hook is kept for backward compatibility with components that still use isDarkMode prop.
 * 
 * For new components, use CSS variables directly:
 * - var(--bg-page)
 * - var(--text-primary)
 * - etc.
 */

import { useMemo } from 'react';

interface ThemeClasses {
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    bgPage: string;
    bgCard: string;
    bgCardHover: string;
    borderColor: string;
    borderColorAccent: string;
    pageContainer: string;
    glassCard: (accentColor?: 'purple' | 'cyan' | 'amber' | 'blue' | 'green') => string;
}

/**
 * @deprecated Use CSS variables instead of this hook.
 * Example: className="bg-surface" or var(--bg-surface)
 */
export function useTheme(isDarkMode: boolean): ThemeClasses {
    return useMemo(() => {
        // These classes are now handled by CSS variables automatically
        // This hook is kept for backward compatibility
        return {
            textPrimary: 'text-primary',
            textSecondary: 'text-secondary',
            textMuted: 'text-muted',
            bgPage: 'bg-page',
            bgCard: 'bg-surface',
            bgCardHover: 'hover:bg-surface-alt',
            borderColor: 'border-default',
            borderColorAccent: 'border-accent-secondary/30',
            pageContainer: 'page-container',
            glassCard: () => 'glass-panel',
        };
    }, [isDarkMode]);
}

export default useTheme;
