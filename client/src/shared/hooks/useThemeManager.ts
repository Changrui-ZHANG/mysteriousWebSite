import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { STORAGE_KEYS, TIMING } from '../constants/config';

export type Theme = 'light' | 'dark' | 'system' | 'paper';

/**
 * Simplified theme manager hook
 * Reduces complexity while maintaining flicker-free theme switching
 */
export function useThemeManager() {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark';
        const saved = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
        return saved || 'dark';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

    // Resolve theme to actual light/dark value
    const resolveTheme = useCallback((themeValue: Theme): 'light' | 'dark' => {
        if (themeValue === 'paper') return 'light';
        if (themeValue === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return themeValue as 'light' | 'dark';
    }, []);

    // Apply theme to DOM with optional transition blocking
    const applyTheme = useCallback((themeValue: Theme, preventTransition = false) => {
        const root = document.documentElement;
        const body = document.body;
        const effectiveTheme = resolveTheme(themeValue);

        // Prevent transitions during theme change to avoid flicker
        if (preventTransition) {
            root.style.setProperty('--theme-transition', 'none');
        }

        // Apply theme attributes and classes
        root.setAttribute('data-theme', themeValue);
        root.className = root.className.replace(/\b(light|dark)\b/g, '');
        root.classList.add(effectiveTheme);
        
        body.className = body.className.replace(/\b(light|dark)\b/g, '');
        body.classList.add(effectiveTheme);

        setResolvedTheme(effectiveTheme);

        // Re-enable transitions after DOM update
        if (preventTransition) {
            setTimeout(() => {
                root.style.removeProperty('--theme-transition');
            }, TIMING.THEME_TRANSITION_DURATION);
        }
    }, [resolveTheme]);

    // Change theme with persistence
    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    }, []);

    // Toggle between light and dark
    const toggleTheme = useCallback(() => {
        const nextTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    }, [resolvedTheme, setTheme]);

    // Apply theme changes immediately before paint
    useLayoutEffect(() => {
        applyTheme(theme, true);
    }, [theme, applyTheme]);

    // Listen for system theme changes when in system mode
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system', true);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, applyTheme]);

    return {
        theme,
        resolvedTheme,
        isDarkMode: resolvedTheme === 'dark',
        isPaperTheme: theme === 'paper',
        setTheme,
        toggleTheme,
    };
}

export default useThemeManager;
