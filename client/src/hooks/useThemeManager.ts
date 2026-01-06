import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'app-theme';

/**
 * Hook centralisé pour la gestion du thème
 * 
 * Optimisé pour éviter les flashs (flickering) lors du changement :
 * - Utilisation de useLayoutEffect pour les modifs DOM avant le paint
 * - Désactivation temporaire des transitions via la classe .no-transitions
 * - Batching des mises à jour d'état
 */
export function useThemeManager() {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark';
        const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
        return saved || 'dark';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
    const isInitialMount = useRef(true);

    // Résoudre le thème effectif (light ou dark)
    const resolveTheme = useCallback((themeValue: Theme): 'light' | 'dark' => {
        if (themeValue === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return themeValue as 'light' | 'dark';
    }, []);

    // Appliquer le thème au DOM de manière atomique
    const applyTheme = useCallback((themeValue: 'light' | 'dark', skipTransition = false) => {
        const root = document.documentElement;

        // Bloquer les transitions si demandé (pour éviter le clignotement)
        if (skipTransition) {
            root.classList.add('no-transitions');
        }

        // Mises à jour DOM synchrones
        root.setAttribute('data-theme', themeValue);
        root.classList.remove('light', 'dark');
        root.classList.add(themeValue);

        // Body background micro-fix pour les thèmes extrêmes
        let bgColor = '#0a0a0b'; // default dark
        if (themeValue === 'light') bgColor = '#fcfcfd';

        document.body.style.backgroundColor = bgColor;
        root.style.backgroundColor = bgColor;

        // Mettre à jour l'état React pour les composants qui en dépendent
        setResolvedTheme(themeValue);

        // Débloquer les transitions après un court délai
        if (skipTransition) {
            // Un petit timeout permet au navigateur d'appliquer les nouvelles couleurs sans transition
            setTimeout(() => {
                root.classList.remove('no-transitions');
            }, 50);
        }
    }, []);

    // Changer le thème
    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
        // On laisse useLayoutEffect gérer l'application pour éviter les doubles appels
    }, []);

    // Toggle entre light et dark
    const toggleTheme = useCallback(() => {
        const nextTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    }, [resolvedTheme, setTheme]);

    // Application du thème au plus tôt avant le paint
    useLayoutEffect(() => {
        const effectiveTheme = resolveTheme(theme);

        // On bloque les transitions SEULEMENT lors d'un switch manuel, pas au montage initial
        const shouldSkipTransition = !isInitialMount.current;
        applyTheme(effectiveTheme, shouldSkipTransition);

        isInitialMount.current = false;
    }, [theme, applyTheme, resolveTheme]);

    // Écoute des changements système (seulement si en mode system)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme(resolveTheme('system'), true);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, applyTheme, resolveTheme]);

    return {
        theme,
        resolvedTheme,
        isDarkMode: resolvedTheme === 'dark',
        setTheme,
        toggleTheme,
    };
}

export default useThemeManager;
