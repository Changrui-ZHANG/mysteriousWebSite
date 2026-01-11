import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook for managing message translations
 * Handles translation state and API calls
 */
export function useMessageTranslation() {
    const { t, i18n } = useTranslation();
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [translating, setTranslating] = useState<Set<string>>(new Set());
    const [showTranslated, setShowTranslated] = useState<Set<string>>(new Set());

    // Translation handler
    const handleTranslate = useCallback(async (msgId: string, text: string) => {
        // Toggle display if translation already exists
        if (translations[msgId]) {
            setShowTranslated(prev => {
                const newSet = new Set(prev);
                if (newSet.has(msgId)) {
                    newSet.delete(msgId);
                } else {
                    newSet.add(msgId);
                }
                return newSet;
            });
            return;
        }

        // Start translation process
        setTranslating(prev => new Set(prev).add(msgId));
        
        try {
            const targetLang = i18n.language === 'zh' ? 'zh-CN' : i18n.language;
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${targetLang}`
            );
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData?.translatedText) {
                const translatedText = data.responseData.translatedText;
                const finalText = translatedText.startsWith("MYMEMORY WARNING")
                    ? `⚠️ ${t('messages.translation_limit')}`
                    : translatedText;
                
                setTranslations(prev => ({ ...prev, [msgId]: finalText }));
                setShowTranslated(prev => new Set(prev).add(msgId));
            } else {
                setTranslations(prev => ({ 
                    ...prev, 
                    [msgId]: `⚠️ ${t('messages.translation_error')}` 
                }));
                setShowTranslated(prev => new Set(prev).add(msgId));
            }
        } catch (error) {
            console.error("Failed to translate:", error);
            setTranslations(prev => ({ 
                ...prev, 
                [msgId]: `⚠️ ${t('messages.translation_error')}` 
            }));
        } finally {
            setTranslating(prev => {
                const newSet = new Set(prev);
                newSet.delete(msgId);
                return newSet;
            });
        }
    }, [translations, i18n.language, t]);

    // Clear translation for a message
    const clearTranslation = useCallback((msgId: string) => {
        setTranslations(prev => {
            const newTranslations = { ...prev };
            delete newTranslations[msgId];
            return newTranslations;
        });
        setShowTranslated(prev => {
            const newSet = new Set(prev);
            newSet.delete(msgId);
            return newSet;
        });
    }, []);

    // Clear all translations
    const clearAllTranslations = useCallback(() => {
        setTranslations({});
        setShowTranslated(new Set());
        setTranslating(new Set());
    }, []);

    return {
        // State
        translations,
        translating,
        showTranslated,

        // Actions
        handleTranslate,
        clearTranslation,
        clearAllTranslations,
    };
}