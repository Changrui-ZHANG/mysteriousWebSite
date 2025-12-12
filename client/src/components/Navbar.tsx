import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

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

export function Navbar({ isDarkMode, toggleTheme, user, onOpenLogin, onLogout }: NavbarProps) {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference text-white`}>
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
                >
                    <motion.span
                        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
                        className="w-full h-0.5 bg-white block transition-all"
                    />
                    <motion.span
                        animate={{ opacity: isOpen ? 0 : 1 }}
                        className="w-full h-0.5 bg-white block transition-all"
                    />
                    <motion.span
                        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
                        className="w-full h-0.5 bg-white block transition-all"
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

                    <div className="w-[1px] h-[20px] bg-white opacity-20"></div>

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

                    <div className="w-[1px] h-[20px] bg-white opacity-20"></div>

                    <div className="flex gap-2 opacity-70">
                        <button onClick={() => changeLanguage('en')} className={`hover:underline ${i18n.language === 'en' ? 'opacity-100 font-bold' : ''}`}>EN</button>
                        <button onClick={() => changeLanguage('fr')} className={`hover:underline ${i18n.language === 'fr' ? 'opacity-100 font-bold' : ''}`}>FR</button>
                        <button onClick={() => changeLanguage('zh')} className={`hover:underline ${i18n.language === 'zh' ? 'opacity-100 font-bold' : ''}`}>ZH</button>
                    </div>

                    <div className="w-[1px] h-[20px] bg-white opacity-20"></div>

                    <button
                        onClick={toggleTheme}
                        className="uppercase tracking-widest hover:opacity-100 opacity-60 transition-opacity"
                    >
                        {isDarkMode ? t('navbar.theme.light') : t('navbar.theme.dark')}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center gap-8 md:hidden font-mono text-xl z-40"
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

                            <div className="flex gap-6 opacity-70">
                                <button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'opacity-100 font-bold' : ''}>EN</button>
                                <button onClick={() => changeLanguage('fr')} className={i18n.language === 'fr' ? 'opacity-100 font-bold' : ''}>FR</button>
                                <button onClick={() => changeLanguage('zh')} className={i18n.language === 'zh' ? 'opacity-100 font-bold' : ''}>ZH</button>
                            </div>

                            <button onClick={() => { toggleTheme(); setIsOpen(false); }} className="opacity-60 uppercase text-sm tracking-widest mt-4">
                                {isDarkMode ? t('navbar.theme.light') : t('navbar.theme.dark')}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}
