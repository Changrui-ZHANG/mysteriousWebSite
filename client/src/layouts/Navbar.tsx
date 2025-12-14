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
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    onAdminLogin?: (code: string) => boolean;
    onAdminLogout?: () => void;
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

export function Navbar({ isDarkMode, toggleTheme, user, onOpenLogin, onLogout, isAdmin = false, isSuperAdmin = false, onAdminLogin, onAdminLogout }: NavbarProps) {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Admin Login State
    const [showAdminInput, setShowAdminInput] = useState(false);
    const [adminCode, setAdminCode] = useState('');

    const submitAdminCode = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (onAdminLogin && onAdminLogin(adminCode)) {
            setAdminCode('');
            setShowAdminInput(false);
        } else {
            alert(t('admin.invalid_code') || 'Invalid admin code');
        }
    };

    // Lock background scroll when mobile menu is open (including Lenis smooth scroll)
    // But allow the menu overlay itself to scroll
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            // Lock body scroll and maintain scroll position
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
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
                        <Link to="/suggestions" className="hover:text-cyan-400 transition-colors">{t('nav.suggestions')}</Link>
                        <Link to="/calendar" className="hover:text-cyan-400 transition-colors">{t('nav.calendar')}</Link>
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

                    {/* Admin Section in Navbar */}
                    <div className="relative">
                        {isAdmin ? (
                            <button
                                onClick={onAdminLogout}
                                className={`text-xs px-2 py-1 rounded border ${isSuperAdmin ? 'border-purple-500 text-purple-400' : 'border-green-500 text-green-500'} hover:opacity-80 transition-opacity`}
                                title="Admin Logout"
                            >
                                {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowAdminInput(!showAdminInput)}
                                    className="hover:scale-110 transition-transform"
                                    title="Admin Access"
                                >
                                    🔐
                                </button>
                                {showAdminInput && (
                                    <form onSubmit={submitAdminCode} className={`absolute top-full right-0 mt-2 p-2 rounded-lg shadow-xl z-50 flex gap-2 ${isDarkMode ? 'bg-black/90 border border-white/10' : 'bg-white border border-gray-200'}`}>
                                        <input
                                            type="password"
                                            value={adminCode}
                                            onChange={(e) => setAdminCode(e.target.value)}
                                            placeholder="Code"
                                            className={`w-24 px-2 py-1 text-xs rounded border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-300'}`}
                                            autoFocus
                                        />
                                        <button type="submit" className="px-2 py-1 bg-green-500 text-white text-xs rounded font-bold">→</button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>

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
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed inset-0 h-[100dvh] ${isDarkMode ? 'bg-black/95 text-white' : 'bg-white/95 text-black'} flex flex-col items-center justify-start pt-28 pb-10 gap-8 md:hidden font-mono text-xl z-40 overflow-y-auto`}
                    >
                        {/* Navigation Links */}
                        <div className="flex flex-col items-center gap-6 w-full px-8">
                            {[
                                { to: "/", label: t('nav.home') },
                                { to: "/cv", label: t('nav.cv') },
                                { to: "/game", label: t('nav.game') },
                                { to: "/messages", label: t('nav.messages') },
                                { to: "/suggestions", label: t('nav.suggestions') },
                                { to: "/calendar", label: t('nav.calendar') }
                            ].map((link) => (
                                <Link
                                    key={link.to}
                                    onClick={() => setIsOpen(false)}
                                    to={link.to}
                                    className="w-full text-center py-2 hover:bg-current/10 rounded-lg transition-colors font-bold text-2xl"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="w-24 h-[1px] bg-current opacity-20 shrink-0"></div>

                        {/* Mobile Auth */}
                        <div className="w-full px-8 flex flex-col items-center gap-4">
                            {user ? (
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm opacity-60">Signed in as</span>
                                        <span className="font-bold text-cyan-500 text-xl">{user.username}</span>
                                    </div>
                                    <button
                                        onClick={() => { onLogout && onLogout(); }}
                                        className="w-full py-3 border border-red-500 text-red-500 rounded-lg flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <FaSignOutAlt /> {t('auth.logout')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { onOpenLogin(); setIsOpen(false); }}
                                    className="w-full py-3 bg-green-500 text-white rounded-lg flex items-center justify-center gap-3 hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all font-bold"
                                >
                                    <FaUser /> {t('auth.login')}
                                </button>
                            )}
                        </div>

                        {/* Mobile Admin */}
                        <div className="w-full px-8 flex flex-col items-center gap-4">
                            {isAdmin ? (
                                <button
                                    onClick={() => { onAdminLogout && onAdminLogout(); }}
                                    className="text-purple-500 text-sm border border-purple-500 px-4 py-2 rounded-full hover:bg-purple-500 hover:text-white transition-colors"
                                >
                                    Log out {isSuperAdmin ? 'Super Admin' : 'Admin'}
                                </button>
                            ) : (
                                <div className="flex flex-col items-center gap-2 w-full max-w-xs p-4 rounded-xl bg-current/5 border border-current/10">
                                    <span className="text-xs opacity-50 uppercase tracking-widest font-bold">Admin Access</span>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (onAdminLogin && onAdminLogin(adminCode)) {
                                                setAdminCode('');
                                            }
                                        }}
                                        className="flex w-full gap-2"
                                    >
                                        <input
                                            type="password"
                                            value={adminCode}
                                            onChange={(e) => setAdminCode(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-white/10 rounded border border-current/20 text-center"
                                            placeholder="Code"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-current/10 hover:bg-current/20 rounded font-bold transition-colors"
                                        >
                                            →
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="w-24 h-[1px] bg-current opacity-20 shrink-0"></div>

                        {/* Settings */}
                        <div className="flex flex-col items-center gap-6 w-full pb-8">
                            <div className="flex gap-4 p-2 bg-current/5 rounded-full">
                                <LanguageButton lang="en" label="EN" flagCode="gb" currentLang={i18n.language} onClick={changeLanguage} />
                                <LanguageButton lang="fr" label="FR" flagCode="fr" currentLang={i18n.language} onClick={changeLanguage} />
                                <LanguageButton lang="zh" label="ZH" flagCode="cn" currentLang={i18n.language} onClick={changeLanguage} />
                            </div>

                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-3 px-6 py-3 rounded-full border border-current/20 hover:bg-current/5 transition-colors uppercase tracking-widest text-sm font-bold"
                            >
                                {isDarkMode ? <FaSun className="text-yellow-400 w-5 h-5" /> : <FaMoon className="text-blue-500 w-5 h-5" />}
                                <span>{isDarkMode ? t('navbar.theme.light') : t('navbar.theme.dark')}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
