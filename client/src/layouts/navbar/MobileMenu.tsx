/**
 * MobileMenu - Mobile navigation overlay
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaSun, FaMoon, FaCog } from 'react-icons/fa';
import { useThemeManager } from '../../hooks/useThemeManager';
import { LanguageButton } from './LanguageButton';

interface User { userId: string; username: string; }

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    onOpenLogin: () => void;
    onLogout?: () => void;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    loginCode: string;
    setLoginCode: (code: string) => void;
    onAdminLogin?: (code: string) => Promise<boolean>;
    onAdminLogout?: () => void;
    onShowSiteControls: () => void;
    changeLanguage: (lng: string) => void;
}

export function MobileMenu({
    isOpen, onClose, user, onOpenLogin, onLogout, isAdmin, isSuperAdmin,
    loginCode, setLoginCode, onAdminLogin, onAdminLogout, onShowSiteControls,
    changeLanguage,
}: MobileMenuProps) {
    const { t, i18n } = useTranslation();
    const { isDarkMode, toggleTheme } = useThemeManager();

    const navLinks = [
        { to: "/", label: t('nav.home') },
        { to: "/cv", label: t('nav.cv') },
        { to: "/game", label: t('nav.game') },
        { to: "/messages", label: t('nav.messages') },
        { to: "/suggestions", label: t('nav.suggestions') },
        { to: "/calendar", label: t('nav.calendar') },
        { to: "/learning", label: t('nav.learning') }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 h-[100dvh] bg-page text-primary flex flex-col items-center justify-start pt-28 pb-10 gap-8 lg:hidden font-mono text-xl z-40 overflow-y-auto"
                >
                    {/* Navigation Links */}
                    <div className="flex flex-col items-center gap-6 w-full px-8">
                        {navLinks.map((link) => (
                            <Link key={link.to} onClick={onClose} to={link.to} className="w-full text-center py-2 hover:bg-current/10 rounded-lg transition-colors font-bold text-2xl">
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="w-24 h-[1px] bg-current opacity-20 shrink-0" />

                    {/* Mobile Auth */}
                    <div className="w-full px-8 flex flex-col items-center gap-4">
                        {user ? (
                            <div className="flex flex-col items-center gap-4 w-full">
                                <div className="flex flex-col items-center">
                                    <span className="text-sm opacity-60">{t('auth.signed_in_as')}</span>
                                    <span className="font-bold text-cyan-500 text-xl">{user.username}</span>
                                </div>
                                <button onClick={() => onLogout?.()} className="w-full py-3 border border-red-500 text-red-500 rounded-lg flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all">
                                    <FaSignOutAlt /> {t('auth.logout')}
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => { onOpenLogin(); onClose(); }} className="w-full py-3 bg-green-500 text-white rounded-lg flex items-center justify-center gap-3 hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all font-bold">
                                <FaUser /> {t('auth.login')}
                            </button>
                        )}
                    </div>

                    {/* Mobile Admin */}
                    <div className="w-full px-8 flex flex-col items-center gap-4">
                        {isAdmin ? (
                            <div className="flex w-full items-center gap-2">
                                <button onClick={() => { onClose(); onShowSiteControls(); }} className="flex-1 py-2 bg-current/5 border border-current/10 rounded-lg flex items-center justify-center gap-2 hover:bg-current/10 transition-colors font-bold text-xs">
                                    <FaCog /> {t('admin.site_settings')}
                                </button>
                                <button onClick={() => onAdminLogout?.()} className="flex-1 text-purple-500 text-xs border border-purple-500 px-2 py-2 rounded-lg hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                                    <FaSignOutAlt /> {isSuperAdmin ? 'Super' : 'Admin'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 w-full max-w-xs p-4 rounded-xl bg-current/5 border border-current/10">
                                <span className="text-xs opacity-50 uppercase tracking-widest font-bold">{t('auth.admin_access')}</span>
                                <form onSubmit={async (e) => { e.preventDefault(); if (onAdminLogin) { const success = await onAdminLogin(loginCode); if (success) setLoginCode(''); } }} className="flex w-full gap-2">
                                    <input
                                        type="password"
                                        value={loginCode}
                                        onChange={(e) => setLoginCode(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-inset rounded-lg border border-current/10 focus:border-accent-info outline-none text-center font-mono"
                                        placeholder={t('admin.code_placeholder')}
                                    />
                                    <button type="submit" className="px-6 py-3 bg-cyan-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95">→</button>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="w-24 h-[1px] bg-current opacity-20 shrink-0" />

                    {/* Settings */}
                    <div className="flex flex-col items-center gap-6 w-full pb-8">
                        <div className="flex gap-4 p-2 bg-current/5 rounded-full">
                            <LanguageButton lang="en" label="EN" flagCode="gb" currentLang={i18n.language} onClick={changeLanguage} />
                            <LanguageButton lang="fr" label="FR" flagCode="fr" currentLang={i18n.language} onClick={changeLanguage} />
                            <LanguageButton lang="zh" label="ZH" flagCode="cn" currentLang={i18n.language} onClick={changeLanguage} />
                        </div>
                        <button onClick={toggleTheme} className="flex items-center gap-3 px-6 py-3 rounded-full border border-current/20 hover:opacity-60 transition-opacity uppercase tracking-widest text-sm font-bold">
                            {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                            <span>{isDarkMode ? t('navbar.theme.light') : t('navbar.theme.dark')}</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
