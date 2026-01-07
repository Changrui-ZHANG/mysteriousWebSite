import { useState, useCallback } from 'react';

const STORAGE_KEY = 'arcade_muted';

interface UseMuteReturn {
    isMuted: boolean;
    toggleMute: () => void;
    setMuted: (muted: boolean) => void;
}

/**
 * Hook to manage audio mute state with localStorage persistence.
 * Used across all game components to provide consistent mute behavior.
 */
export function useMute(): UseMuteReturn {
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });

    const setMuted = useCallback((muted: boolean) => {
        setIsMuted(muted);
        try {
            localStorage.setItem(STORAGE_KEY, String(muted));
        } catch (error) {
            console.error('Failed to save mute setting:', error);
        }
    }, []);

    const toggleMute = useCallback(() => {
        setMuted(!isMuted);
    }, [isMuted, setMuted]);

    return {
        isMuted,
        toggleMute,
        setMuted,
    };
}
