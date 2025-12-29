import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'app-theme';

/**
 * Hook centralisé pour la gestion du thème
 * 
 * Fonctionnalités:
 * - Persistance dans localStorage
 * - Support du thème système (prefers-color-scheme)
 * - Synchronisation avec l'attribut data-theme sur <html>
 * - Prévention du flash de thème incorrect
 */
export function useThemeManager() {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark';
        const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
        return saved || 'dark';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

    // Résoudre le thème effectif (light ou dark)
    const resolveTheme = useCallback((themeValue: Theme): 'light' | 'dark' => {
        if (themeValue === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return themeValue;
    }, []);

    // Appliquer le thème au DOM
    const applyTheme = useCallback((themeValue: 'light' | 'dark') => {
        const root = document.documentElement;
        
        // Mettre à jour data-theme
        root.setAttribute('data-theme', themeValue);
        
        // Mettre à jour la classe pour compatibilité
        root.classList.remove('light', 'dark');
        root.classList.add(themeValue);
        
        // Mettre à jour la couleur de fond du body pour éviter les flashs
        const bgColor = themeValue === 'dark' ? '#0a0a0b' : '#fcfcfd';
        document.body.style.backgroundColor = bgColor;
        root.style.backgroundColor = bgColor;
        
        setResolvedTheme(themeValue);
    }, []);

    // Changer le thème
    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
        applyTheme(resolveTheme(newTheme));
    }, [applyTheme, resolveTheme]);

    // Toggle entre light et dark
    const toggleTheme = useCallback(() => {
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }, [resolvedTheme, setTheme]);

    // Initialisation et écoute des changements système
    useEffect(() => {
        // Appliquer le thème initial
        applyTheme(resolveTheme(theme));

        // Écouter les changements de préférence système
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme(resolveTheme('system'));
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, applyTheme, resolveTheme]);

    return {
        theme,           // Valeur stockée: 'light' | 'dark' | 'system'
        resolvedTheme,   // Thème effectif: 'light' | 'dark'
        isDarkMode: resolvedTheme === 'dark',
        setTheme,
        toggleTheme,
    };
}

export default useThemeManager;
