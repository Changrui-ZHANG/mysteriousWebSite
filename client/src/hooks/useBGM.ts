import { useEffect, useRef } from 'react';

/**
 * Hook to manage background music in games.
 * Handles loading, looping, and muting.
 * 
 * @param url The direct URL to the BGM file.
 * @param enabled Whether the audio is currently unmuted.
 * @param volume Initial volume (0 to 1). Default is 0.4 for BGM.
 */
export const useBGM = (url: string, enabled: boolean = true, volume: number = 0.4) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        // Create audio element
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = volume;
        audioRef.current = audio;

        // Cleanup on unmount
        return () => {
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, [url]); // Removed volume from dependencies to prevent re-creation

    useEffect(() => {
        if (!audioRef.current) return;

        if (enabled) {
            // Attempt to play
            audioRef.current.play().catch(err => {
                // Autoplay might be blocked until user interaction
                console.warn("BGM Autoplay blocked. Waiting for interaction.", err);
            });
        } else {
            audioRef.current.pause();
        }
    }, [enabled]);

    // Resume play on interaction if it was blocked
    useEffect(() => {
        const handleInteraction = () => {
            if (enabled && audioRef.current && audioRef.current.paused) {
                audioRef.current.play().catch(() => { });
            }
        };

        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [enabled]);

    return {
        stop: () => audioRef.current?.pause(),
        play: () => enabled && audioRef.current?.play(),
    };
};
