import { useCallback, useState, useEffect } from 'react';

interface UseSpeechOptions {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
}

interface UseSpeechReturn {
    speak: (text: string) => void;
    cancel: () => void;
    speaking: boolean;
    supported: boolean;
    voices: SpeechSynthesisVoice[];
}

export function useSpeech(options: UseSpeechOptions = {}): UseSpeechReturn {
    const [speaking, setSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setSupported(true);

            // Load voices
            const loadVoices = () => {
                const available = window.speechSynthesis.getVoices();
                setVoices(available);
            };

            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;

            return () => {
                window.speechSynthesis.onvoiceschanged = null;
            };
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!supported) return;

        // Cancel existing
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || 'fr-FR';
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [supported, options.lang, options.rate, options.pitch, options.volume]);

    const cancel = useCallback(() => {
        if (supported) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
        }
    }, [supported]);

    return { speak, cancel, speaking, supported, voices };
}
