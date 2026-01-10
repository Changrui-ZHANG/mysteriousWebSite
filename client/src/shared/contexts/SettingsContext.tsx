import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchJson } from '../api/httpClient';
import { API_ENDPOINTS } from '../constants/endpoints';

interface SettingsContextType {
    settings: Record<string, string>;
    isLoading: boolean;
    refreshSettings: () => Promise<void>;
    isEnabled: (key: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    const refreshSettings = useCallback(async () => {
        try {
            const data = await fetchJson<Record<string, string>>(API_ENDPOINTS.SETTINGS.PUBLIC);
            setSettings(data);
        } catch (err) {
            console.error("Failed to load settings", err);
            // En cas d'erreur, on continue avec des paramètres par défaut
            setSettings({});
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