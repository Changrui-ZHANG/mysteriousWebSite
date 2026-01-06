/**
 * MobileMenu - Mobile navigation overlay with Liquid Glass aesthetic
 * Theme-aware implementation supporting Light, Dark, and Paper themes.
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUser, FaSignOutAlt, FaSun, FaMoon, FaCog,
    FaHome, FaUserAstronaut, FaGamepad, FaComments,
    FaLightbulb, FaCalendarAlt, FaGraduationCap, FaTimes
} from 'react-icons/fa';
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

const navLinks = [
    { to: "/", icon: FaHome, labelKey: 'nav.home' },
    { to: "/cv", icon: FaUserAstronaut, labelKey: 'nav.cv' },
    { to: "/game", icon: FaGamepad, labelKey: 'nav.game' },
    { to: "/messages", icon: FaComments, labelKey: 'nav.messages' },
    { to: "/suggestions", icon: FaLightbulb, labelKey: 'nav.suggestions' },
    { to: "/calendar", icon: FaCalendarAlt, labelKey: 'nav.calendar' },
    { to: "/learning", icon: FaGraduationCap, labelKey: 'nav.learning' }
];

export function MobileMenu({
    isOpen, onClose, user, onOpenLogin, onLogout, isAdmin,
    loginCode, setLoginCode, onAdminLogin, onAdminLogout, onShowSiteControls,
    changeLanguage,
}: MobileMenuProps) {
    const { t, i18n } = useTranslation();
    const { resolvedTheme, toggleTheme } = useThemeManager();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
        exit: { opacity: 0 }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 30 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 30 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 h-[100dvh] lg:hidden z-50 overflow-hidden"
                >
                    {/* Backdrop Overlay - Uses theme overlay color */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-overlay backdrop-blur-sm"
                    />

                    {/* Glass Panel - Uses theme-aware surface translucent background */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-surface-translucent backdrop-blur-surface border-l border-default shadow-xl flex flex-col text-primary"
                    >
                        {/* Header with close button */}
                        <div className="flex items-center justify-between p-6 border-b border-default">
                            <span className="font-heading font-bold text-lg tracking-tight uppercase opacity-80">
                                {t('nav.menu')}
                            </span>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-inset border border-default flex items-center justify-center hover:bg-surface transition-all active:scale-95 text-secondary hover:text-primary"
                                aria-label={t('common.close')}
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                            {/* Navigation Links */}
                            <motion.nav
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="px-4 space-y-1.5"
                            >
                                {navLinks.map((link) => (
                                    <motion.div key={link.to} variants={itemVariants}>
                                        <Link
                                            onClick={onClose}
                                            to={link.to}
                                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-inset transition-all group relative overflow-hidden active:scale-[0.98]"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-inset border border-default flex items-center justify-center group-hover:bg-accent-primary/10 group-hover:border-accent-primary/30 transition-all">
                                                <link.icon className="w-4 h-4 text-secondary group-hover:text-accent-primary transition-colors" />
                                            </div>
                                            <span className="font-heading font-semibold text-base tracking-wide text-secondary group-hover:text-primary transition-colors">
                                                {t(link.labelKey)}
                                            </span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.nav>

                            {/* Divider */}
                            <div className="mx-8 my-6 h-px bg-gradient-to-r from-transparent via-default to-transparent opacity-50" />

                            {/* Auth Section */}
                            <div className="px-4">
                                {user ? (
                                    <div className="p-4 rounded-2xl bg-inset border border-default space-y-4">
                                        <div className="text-center">
                                            <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">
                                                {t('auth.signed_in_as')}
                                            </p>
                                            <p className="font-black text-accent-primary text-lg tracking-tight">
                                                {user.username}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onLogout?.()}
                                            className="w-full py-3 rounded-xl border border-accent-danger/30 text-accent-danger flex items-center justify-center gap-2 hover:bg-accent-danger/10 transition-all text-sm font-bold active:scale-95"
                                        >
                                            <FaSignOutAlt className="w-3.5 h-3.5" />
                                            {t('auth.logout')}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { onOpenLogin(); onClose(); }}
                                        className="w-full py-4 rounded-2xl bg-accent-success text-white flex items-center justify-center gap-3 shadow-lg shadow-accent-success/20 font-black text-base hover:shadow-accent-success/40 transition-all active:scale-95"
                                    >
                                        <FaUser className="w-4 h-4" />
                                        {t('auth.login')}
                                    </button>
                                )}
                            </div>

                            {/* Admin Section */}
                            {isAdmin && (
                                <div className="px-4 mt-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { onClose(); onShowSiteControls(); }}
                                            className="flex-grow py-3 rounded-xl bg-inset border border-default flex items-center justify-center gap-2 hover:bg-surface transition-all text-sm font-bold text-secondary hover:text-primary active:scale-95"
                                        >
                                            <FaCog className="w-4 h-4 opacity-70" />
                                            {t('admin.site_settings')}
                                        </button>
                                        <button
                                            onClick={() => onAdminLogout?.()}
                                            className="px-4 py-3 rounded-xl border border-accent-secondary/50 text-accent-secondary hover:bg-accent-secondary/10 transition-all text-sm active:scale-95"
                                            title={t('auth.logout')}
                                        >
                                            <FaSignOutAlt className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Admin Login (if not admin) */}
                            {!isAdmin && (
                                <div className="px-4 mt-4">
                                    <div className="p-5 rounded-2xl bg-inset border border-default shadow-inner">
                                        <p className="text-[10px] text-center text-muted uppercase tracking-tighter font-black mb-3 opacity-60">
                                            {t('auth.admin_access')}
                                        </p>
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                if (onAdminLogin) {
                                                    const success = await onAdminLogin(loginCode);
                                                    if (success) setLoginCode('');
                                                }
                                            }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="password"
                                                value={loginCode}
                                                onChange={(e) => setLoginCode(e.target.value)}
                                                className="flex-1 px-4 py-3 bg-surface border border-default rounded-xl focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 outline-none text-center font-mono text-sm transition-all"
                                                placeholder={t('admin.code_placeholder')}
                                            />
                                            <button
                                                type="submit"
                                                className="px-5 py-3 bg-accent-info text-inverse rounded-xl font-black hover:bg-accent-primary transition-all active:scale-95 shadow-lg shadow-accent-info/20"
                                            >
                                                →
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer with settings */}
                        <div className="p-6 border-t border-default space-y-5 bg-inset/30">
                            {/* Language Selector */}
                            <div className="flex justify-center items-center gap-4">
                                <LanguageButton lang="en" label="EN" flagCode="gb" currentLang={i18n.language} onClick={changeLanguage} />
                                <div className="w-px h-4 bg-default" />
                                <LanguageButton lang="fr" label="FR" flagCode="fr" currentLang={i18n.language} onClick={changeLanguage} />
                                <div className="w-px h-4 bg-default" />
                                <LanguageButton lang="zh" label="ZH" flagCode="cn" currentLang={i18n.language} onClick={changeLanguage} />
                            </div>

                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="flex items-center justify-between w-full p-4 transition-all duration-300 border bg-white/5 border-white/10 rounded-2xl active:scale-95 group"
                            >
                                <span className="font-bold text-primary">
                                    {resolvedTheme === 'dark' ? t('navbar.theme.light') : t('navbar.theme.dark')}
                                </span>
                                {resolvedTheme === 'dark' ? (
                                    <FaSun className="text-2xl text-amber-400 group-hover:rotate-90 transition-transform duration-500" />
                                ) : (
                                    <FaMoon className="text-2xl text-indigo-400 group-hover:-rotate-12 transition-transform duration-500" />
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
