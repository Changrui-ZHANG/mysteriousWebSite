/**
 * CompactLanguageSelector - Compact dropdown language selector for mobile menu header
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompactLanguageSelectorProps {
    currentLang: string;
    onChange: (lang: string) => void;
}

const languages = [
    { code: 'en', label: 'EN', flagCode: 'gb' },
    { code: 'fr', label: 'FR', flagCode: 'fr' },
    { code: 'zh', label: 'ZH', flagCode: 'cn' }
];

export function CompactLanguageSelector({ currentLang, onChange }: CompactLanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleSelect = (langCode: string) => {
        onChange(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 rounded-lg bg-inset border border-default flex items-center justify-center hover:bg-surface transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
                aria-label="Select language"
            >
                <img
                    src={`https://flagcdn.com/w40/${currentLanguage.flagCode}.png`}
                    srcSet={`https://flagcdn.com/w80/${currentLanguage.flagCode}.png 2x`}
                    alt={currentLanguage.label}
                    className="w-5 h-auto rounded-[2px] shadow-sm"
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 bg-surface border border-default rounded-lg shadow-xl overflow-hidden z-dropdown min-w-[120px]"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-inset transition-colors ${currentLang === lang.code ? 'bg-accent-primary/10 text-accent-primary font-bold' : 'text-secondary'
                                    }`}
                            >
                                <img
                                    src={`https://flagcdn.com/w40/${lang.flagCode}.png`}
                                    srcSet={`https://flagcdn.com/w80/${lang.flagCode}.png 2x`}
                                    alt={lang.label}
                                    className="w-5 h-auto rounded-[2px] shadow-sm"
                                />
                                <span className="text-sm">{lang.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
