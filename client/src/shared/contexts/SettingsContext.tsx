import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { fetchJson } from '../api/httpClient';
import { API_ENDPOINTS } from '../constants/endpoints';

interface SettingsContextType {
    settings: Record<string, string>;
    isLoading: boolean;
    hasError: boolean;
    error: string | null;
    refreshSettings: () => Promise<void>;
    isEnabled: (key: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Once settings loaded successfully, later refreshes are silent (no splash / unmount)
    const hasLoadedRef = useRef(false);

    const refreshSettings = useCallback(async () => {
        const silent = hasLoadedRef.current;
        try {
            if (!silent) setIsLoading(true);
            setError(null);
            const data = await fetchJson<Record<string, string>>(API_ENDPOINTS.SETTINGS.PUBLIC);
            setSettings(data);
            hasLoadedRef.current = true;
        } catch (err) {
            console.error("Failed to load settings", err);
            // Keep previous settings on a failed silent refresh
            if (!silent) {
                setError(err instanceof Error ? err.message : "Impossible de se connecter au serveur");
                setSettings({});
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Démarrer le chargement immédiatement
        refreshSettings();
    }, [refreshSettings]);

    const isEnabled = useCallback((key: string) => settings[key] === 'true', [settings]);

    const value: SettingsContextType = {
        settings,
        isLoading,
        hasError: !!error,
        error,
        refreshSettings,
        isEnabled
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};