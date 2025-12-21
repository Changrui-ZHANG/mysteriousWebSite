import { useState, useCallback } from 'react';

const STORAGE_KEY = 'arcade_bgm_volume';

interface UseBGMVolumeReturn {
    volume: number;
    setVolume: (volume: number) => void;
}

/**
 * Hook to manage background music volume with localStorage persistence.
 */
export function useBGMVolume(initialVolume: number = 0.4): UseBGMVolumeReturn {
    const [volume, setVolumeState] = useState<number>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved !== null ? parseFloat(saved) : initialVolume;
        } catch {
            return initialVolume;
        }
    });

    const setVolume = useCallback((newVolume: number) => {
        setVolumeState(newVolume);
        try {
            localStorage.setItem(STORAGE_KEY, String(newVolume));
        } catch (error) {
            console.error('Failed to save volume setting:', error);
        }
    }, []);

    return {
        volume,
        setVolume,
    };
}
