import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'hit' | 'break' | 'gameover' | 'win' | 'click' | 'powerup';

export const useSound = (enabled: boolean = true) => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext on first user interaction if needed
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }
    }, []);

    const playSound = useCallback((type: SoundType, value?: number) => {
        if (!enabled || !audioContextRef.current) return;

        const ctx = audioContextRef.current;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        // Create main nodes (for simple sounds, complex ones create their own)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'hit': // Paddle/Wall hit - Short, softer ping
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'break': // Brick/Match sound - Play multiple times based on intensity
                // Default to 1 sound if value not provided
                const count = value || 1;
                const baseFreq = 300;

                // Play 'count' sounds in rapid succession
                for (let i = 0; i < count; i++) {
                    const oscNode = ctx.createOscillator();
                    const gainNode = ctx.createGain();

                    oscNode.connect(gainNode);
                    gainNode.connect(ctx.destination);

                    const time = now + (i * 0.08); // 80ms delay between each blip

                    // Slightly increase pitch for each subsequent sound in the burst for satisfaction
                    const noteFreq = baseFreq + (i * 50);

                    oscNode.type = 'triangle';
                    oscNode.frequency.setValueAtTime(noteFreq, time);
                    oscNode.frequency.exponentialRampToValueAtTime(noteFreq * 2, time + 0.08);

                    gainNode.gain.setValueAtTime(0.15, time);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

                    oscNode.start(time);
                    oscNode.stop(time + 0.08);
                }

                // Disconnect unused main nodes to avoid any leak/noise
                osc.disconnect();
                gain.disconnect();
                break;

            case 'gameover': // Power down effect (not sliding whistle)
                osc.type = 'triangle';
                // Low dissonant fade out
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

                osc.start(now);
                osc.stop(now + 0.4);
                break;

            case 'win': // Ascending major chord (pleasing)
                osc.type = 'triangle';
                // Play a quick arpeggio C-E-G-C
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
                osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.3);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

                osc.start(now);
                osc.stop(now + 0.6);
                break;

            case 'click': // Gentle blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;

            case 'powerup': // Sparkly ascending sound
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
        }

    }, [enabled]);

    return { playSound };
};
