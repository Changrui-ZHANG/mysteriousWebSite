import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaSun, FaMoon } from 'react-icons/fa';

interface MaintenancePageProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    message?: string;
    activatedBy?: string;
    onAdminLogin?: (code: string) => Promise<boolean>;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ isDarkMode, toggleTheme, message, activatedBy, onAdminLogin }) => {
    const { t, i18n } = useTranslation();
    const [showAdminInput, setShowAdminInput] = React.useState(false);
    const [loginCode, setLoginCode] = React.useState('');
    const [isChecking, setIsChecking] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onAdminLogin) {
            setIsChecking(true);
            const success = await onAdminLogin(loginCode);
            setIsChecking(false);
            if (!success) {
                alert(t('admin.invalid_code') || "Invalid Code");
            } else {
                setLoginCode('');
            }
        }
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const LanguageButton = ({ lang, flagCode }: { lang: string, flagCode: string }) => (
        <button
            onClick={() => changeLanguage(lang)}
            className={`opacity-50 hover:opacity-100 transition-opacity ${i18n.language === lang ? 'opacity-100 scale-110' : ''}`}
        >
            <img
                src={`https://flagcdn.com/w40/${flagCode}.png`}
                srcSet={`https://flagcdn.com/w80/${flagCode}.png 2x`}
                alt={lang}
                className="w-6 h-auto rounded-[2px] shadow-sm"
            />
        </button>
    );

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center relative ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>

            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
                <div className="flex gap-2 mr-4">
                    <LanguageButton lang="en" flagCode="gb" />
                    <LanguageButton lang="fr" flagCode="fr" />
                    <LanguageButton lang="zh" flagCode="cn" />
                </div>
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                >
                    {isDarkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-500" />}
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
            >
                <div className="text-6xl mb-6">🚧</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
                    {t('maintenance.title') || 'Under Maintenance'}
                </h1>
                <p className="text-xl opacity-70 max-w-md mx-auto mb-8 font-mono whitespace-pre-wrap">
                    {message || t('maintenance.description') || 'The site is currently undergoing necessary maintenance. We will be back shortly.'}
                </p>

                {activatedBy && (
                    <div className="mb-8 text-sm opacity-50 font-mono">
                        Disabled by: <span className="font-bold">{activatedBy}</span>
                    </div>
                )}

                <div className={`h-1 w-24 mx-auto rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-black/10'} mb-12`}>
                    <motion.div
                        className={`h-full rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}
                        animate={{ width: ['0%', '100%', '0%'], x: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* Admin Access Section */}
                {onAdminLogin && (
                    <div className="flex flex-col items-center gap-4">
                        {!showAdminInput ? (
                            <button
                                onClick={() => setShowAdminInput(true)}
                                className={`text-sm opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2 border px-4 py-2 rounded-lg ${isDarkMode ? 'border-white/20' : 'border-black/20'}`}
                            >
                                🔐 {t('auth.admin_access') || "Admin Access"}
                            </button>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={loginCode}
                                        onChange={(e) => setLoginCode(e.target.value)}
                                        placeholder="Admin Code"
                                        className={`px-4 py-2 rounded-lg border text-center font-mono ${isDarkMode ? 'bg-white/10 border-white/20 focus:border-white/50' : 'bg-black/5 border-black/10 focus:border-black/30'} outline-none transition-colors`}
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={isChecking}
                                        className={`px-4 py-2 rounded-lg font-bold ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} transition-colors disabled:opacity-50`}
                                    >
                                        {isChecking ? '...' : 'Go'}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAdminInput(false)}
                                    className="text-xs opacity-40 hover:opacity-80 hover:underline"
                                >
                                    Cancel
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
