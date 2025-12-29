/**
 * @deprecated Use useThemeManager instead for full theme management.
 * This hook is kept for backward compatibility with components that still use isDarkMode prop.
 * 
 * For new components, use CSS variables directly:
 * - var(--color-bg-base)
 * - var(--color-text-primary)
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
 * Example: className="bg-[var(--color-bg-surface)]"
 */
export function useTheme(isDarkMode: boolean): ThemeClasses {
    return useMemo(() => {
        // These classes are now handled by CSS variables automatically
        // This hook is kept for backward compatibility
        return {
            textPrimary: 'text-[var(--color-text-primary)]',
            textSecondary: 'text-[var(--color-text-secondary)]',
            textMuted: 'text-[var(--color-text-muted)]',
            bgPage: 'bg-[var(--color-bg-base)]',
            bgCard: 'bg-[var(--color-bg-surface)]',
            bgCardHover: 'hover:bg-[var(--color-interactive-hover)]',
            borderColor: 'border-[var(--color-border-default)]',
            borderColorAccent: 'border-[var(--color-accent-purple)]/30',
            pageContainer: 'page-container',
            glassCard: () => 'glass-panel',
        };
    }, [isDarkMode]);
}

export default useTheme;
