import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';

interface User {
    userId: string;
    username: string;
}

interface NavbarProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    user?: User | null;
    onOpenLogin: () => void;
    onLogout?: () => void;
}

// Helper component for Language Buttons
const LanguageButton = ({ lang, label, flagCode, currentLang, onClick }: { lang: string, label: string, flagCode: string, currentLang: string, onClick: (l: string) => void }) => (
    <button
        onClick={() => onClick(lang)}
        className={`flex items-center gap-2 transition-all ${currentLang === lang ? 'opacity-100 font-bold scale-105' : 'opacity-60 hover:opacity-100'}`}
        title={label}
    >
        <img
            src={`https://flagcdn.com/w40/${flagCode}.png`}
            srcSet={`https://flagcdn.com/w80/${flagCode}.png 2x`}
            alt={label}
            className="w-5 h-auto rounded-[2px] shadow-sm"
        />
        <span className="hover:underline">{label}</span>
    </button>
);

export function Navbar({ isDarkMode, toggleTheme, user, onOpenLogin, onLogout }: NavbarProps) {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Link to="/" className="text-xl md:text-2xl font-bold font-heading tracking-tighter hover:opacity-80 transition-opacity z-50 relative">
                    {location.pathname === '/cv'
                        ? 'Curriculum vitæ'
                        : location.pathname === '/game'
                            ? t('navbar.arcade_title')
                            : location.pathname === '/messages'
                                ? t('navbar.messages_title')
                                : t('navbar.title')}
                </Link>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden z-50 w-8 h-8 flex flex-col justify-center gap-1.5 focus:outline-none"
                    style={{ position: 'relative', zIndex: 60 }} // Ensure button stays on top
                >
                    <motion.span
                        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
                        className={`w-full h-0.5 block transition-all ${isOpen ? 'bg-white' : 'bg-current'}`}
                    />
                    <motion.span
                        animate={{ opacity: isOpen ? 0 : 1 }}
                        className={`w-full h-0.5 block transition-all ${isOpen ? 'bg-white' : 'bg-current'}`}
                    />
                    <motion.span
                        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
                        className={`w-full h-0.5 block transition-all ${isOpen ? 'bg-white' : 'bg-current'}`}
                    />
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6 font-mono text-sm">
                    <div className="flex gap-4 mr-4">
                        <Link to="/" className="hover:text-cyan-400 transition-colors">{t('nav.home')}</Link>
                        <Link to="/cv" className="hover:text-cyan-400 transition-colors">{t('nav.cv')}</Link>
                        <Link to="/game" className="hover:text-cyan-400 transition-colors">{t('nav.game')}</Link>
                        <Link to="/messages" className="hover:text-cyan-400 transition-colors">{t('nav.messages')}</Link>
                    </div>

                    <div className="w-[1px] h-[20px] bg-current opacity-20"></div>

                    {/* Auth Section */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-cyan-400">{user.username}</span>
                            <button
                                onClick={onLogout}
                                className="hover:text-red-400 transition-colors flex items-center gap-2"
                                title={t('auth.logout')}
                            >
                                <FaSignOutAlt />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onOpenLogin}
                            className="flex items-center gap-2 hover:text-green-400 transition-colors"
                        >
                            <FaUser />
                            <span>{t('auth.login')}</span>
                        </button>
                    )}

                    <div className="w-[1px] h-[20px] bg-current opacity-20"></div>

                    <div className="flex gap-3">
                        {/* Language Buttons */}
                        <LanguageButton lang="en" label="EN" flagCode="gb" currentLang={i18n.language} onClick={changeLanguage} />
                        <LanguageButton lang="fr" label="FR" flagCode="fr" currentLang={i18n.language} onClick={changeLanguage} />
                        <LanguageButton lang="zh" label="ZH" flagCode="cn" currentLang={i18n.language} onClick={changeLanguage} />
                    </div>

                    <div className="w-[1px] h-[20px] bg-current opacity-20"></div>

                    <button
                        onClick={toggleTheme}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors uppercase tracking-widest text-sm ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                    >
                        {isDarkMode ? <FaSun className="text-yellow-400 w-4 h-4" /> : <FaMoon className="text-blue-500 w-4 h-4" />}
                        <span>{isDarkMode ? t('navbar.theme.light') : t('navbar.theme.dark')}</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay - Move outside nav to avoid mix-blend-difference */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 h-[100dvh] bg-black/95 text-white flex flex-col items-center justify-center gap-8 md:hidden font-mono text-xl z-40 touch-none"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <Link onClick={() => setIsOpen(false)} to="/" className="hover:text-cyan-400">{t('nav.home')}</Link>
                            <Link onClick={() => setIsOpen(false)} to="/cv" className="hover:text-cyan-400">{t('nav.cv')}</Link>
                            <Link onClick={() => setIsOpen(false)} to="/game" className="hover:text-cyan-400">{t('nav.game')}</Link>
                            <Link onClick={() => setIsOpen(false)} to="/messages" className="hover:text-cyan-400">{t('nav.messages')}</Link>
                        </div>

                        <div className="w-12 h-[1px] bg-white/20"></div>

                        {/* Mobile Auth */}
                        {user ? (
                            <div className="flex flex-col items-center gap-4">
                                <span className="font-bold text-cyan-400 text-lg">Hello, {user.username}</span>
                                <button
                                    onClick={() => { onLogout && onLogout(); setIsOpen(false); }}
                                    className="text-red-400 hover:text-red-300 flex items-center gap-2"
                                >
                                    <FaSignOutAlt /> {t('auth.logout')}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { onOpenLogin(); setIsOpen(false); }}
                                className="text-green-400 hover:text-green-300 flex items-center gap-2 text-lg"
                            >
                                <FaUser /> {t('auth.login')}
                            </button>
                        )}

                        <div className="w-12 h-[1px] bg-white/20"></div>

                        <div className="flex gap-6">
                            <LanguageButton lang="en" label="EN" flagCode="gb" currentLang={i18n.language} onClick={changeLanguage} />
                            <LanguageButton lang="fr" label="FR" flagCode="fr" currentLang={i18n.language} onClick={changeLanguage} />
                            <LanguageButton lang="zh" label="ZH" flagCode="cn" currentLang={i18n.language} onClick={changeLanguage} />
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="mt-4 flex items-center gap-3 px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors uppercase tracking-widest text-sm"
                        >
                            {isDarkMode ? <FaSun className="text-yellow-400 w-5 h-5" /> : <FaMoon className="text-blue-300 w-5 h-5" />}
                            <span>{isDarkMode ? t('navbar.theme.light') : t('navbar.theme.dark')}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
