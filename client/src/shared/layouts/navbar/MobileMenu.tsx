import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUser, FaSignOutAlt, FaSun, FaMoon, FaCog,
    FaHome, FaUserAstronaut, FaGamepad, FaComments, FaStickyNote,
    FaLightbulb, FaCalendarAlt, FaGraduationCap, FaTimes, FaUserCircle
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeManager } from '../../hooks/useThemeManager';
import { CompactLanguageSelector } from './CompactLanguageSelector';
import { UserAvatar } from '../../components/UserAvatar';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
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
    { to: "/profile", icon: FaUserCircle, labelKey: 'nav.profile' },
    { to: "/notes", icon: FaStickyNote, labelKey: 'nav.notes' },
    { to: "/messages", icon: FaComments, labelKey: 'nav.messages' },
    { to: "/suggestions", icon: FaLightbulb, labelKey: 'nav.suggestions' },
    { to: "/calendar", icon: FaCalendarAlt, labelKey: 'nav.calendar' },
    { to: "/learning", icon: FaGraduationCap, labelKey: 'nav.learning' }
];

export function MobileMenu({
    isOpen, onClose, onOpenLogin, onLogout, isAdmin,
    loginCode, setLoginCode, onAdminLogin, onAdminLogout, onShowSiteControls,
    changeLanguage,
}: MobileMenuProps) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
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
                    className="fixed inset-0 h-[100dvh] lg:hidden z-modal overflow-hidden"
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
                        {/* Header with compact controls */}
                        <div className="flex items-center justify-between p-4 border-b border-default">
                            <span className="font-heading font-bold text-base tracking-tight uppercase opacity-80">
                                {t('nav.menu')}
                            </span>

                            {/* Compact controls */}
                            <div className="flex items-center gap-2">
                                {/* Language selector - compact dropdown */}
                                <CompactLanguageSelector
                                    currentLang={i18n.language}
                                    onChange={changeLanguage}
                                />

                                {/* Theme toggle - icon only */}
                                <button
                                    onClick={toggleTheme}
                                    className="w-9 h-9 rounded-lg bg-inset border border-default flex items-center justify-center hover:bg-surface transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
                                    aria-label={resolvedTheme === 'dark' ? t('navbar.theme.light') : t('navbar.theme.dark')}
                                >
                                    {resolvedTheme === 'dark' ? (
                                        <FaSun className="w-4 h-4 text-amber-400" />
                                    ) : (
                                        <FaMoon className="w-4 h-4 text-indigo-400" />
                                    )}
                                </button>

                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-lg bg-inset border border-default flex items-center justify-center hover:bg-surface transition-all active:scale-95 text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
                                    aria-label={t('common.close')}
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>
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

                            {/* Admin Section */}
                            {isAdmin && (
                                <div className="px-4 mb-4">
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


                        </div>

                        {/* Compact Auth Section at Bottom */}
                        {user && (
                            <div className="border-t border-default bg-inset/30 p-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-inset border border-default">
                                    {/* Avatar - smaller */}
                                    <Link
                                        to="/profile"
                                        onClick={onClose}
                                        className="w-12 h-12 rounded-xl border-2 border-accent-primary/20 bg-white/5 hover:border-accent-primary/40 transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
                                        aria-label={t('nav.profile')}
                                    >
                                        <UserAvatar
                                            userId={user.userId || user.id}
                                            alt={user.username || user.name}
                                            size={44}
                                            className="rounded-lg"
                                        />
                                    </Link>

                                    {/* User info - compact */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-accent-primary truncate">
                                            {user.username}
                                        </p>
                                        <p className="text-[10px] text-muted">
                                            {t('auth.signed_in')}
                                        </p>
                                    </div>

                                    {/* Logout button - to the right */}
                                    <button
                                        onClick={() => onLogout?.()}
                                        className="px-4 py-2 rounded-lg border border-accent-danger/30 text-accent-danger flex items-center gap-2 hover:bg-accent-danger/10 transition-all text-xs font-bold active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-danger focus:ring-offset-2 shrink-0"
                                    >
                                        <FaSignOutAlt className="w-3.5 h-3.5" />
                                        {t('auth.logout')}
                                    </button>
                                </div>

                                {/* Admin Access - Ultra discreet */}
                                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted/50">
                                    <span className="uppercase tracking-wider font-medium shrink-0">Admin</span>
                                    {!isAdmin ? (
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                if (onAdminLogin) {
                                                    const success = await onAdminLogin(loginCode);
                                                    if (success) setLoginCode('');
                                                }
                                            }}
                                            className="flex items-center gap-1 flex-1"
                                        >
                                            <input
                                                type="password"
                                                value={loginCode}
                                                onChange={(e) => setLoginCode(e.target.value)}
                                                className="flex-1 px-2 py-0.5 bg-surface/30 border border-default/30 rounded text-center font-mono text-[10px] focus:border-accent-primary/30 focus:ring-1 focus:ring-accent-primary/10 outline-none transition-all placeholder:text-muted/30"
                                                placeholder="code"
                                            />
                                            <button
                                                type="submit"
                                                className="w-5 h-5 flex items-center justify-center bg-accent-info/60 text-white rounded hover:bg-accent-info transition-all active:scale-90 shrink-0"
                                                title={t('auth.admin_access')}
                                            >
                                                🔐
                                            </button>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => onAdminLogout?.()}
                                            className="w-5 h-5 flex items-center justify-center bg-accent-secondary/60 text-white rounded hover:bg-accent-secondary transition-all active:scale-90 ml-auto shrink-0"
                                            title={t('auth.logout')}
                                        >
                                            🔓
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Login button if not authenticated */}
                        {!user && (
                            <div className="border-t border-default bg-inset/30 p-3">
                                <button
                                    onClick={() => { onOpenLogin(); onClose(); }}
                                    className="w-full py-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-accent-success/30 text-accent-success flex items-center justify-center gap-3 font-bold text-base hover:bg-accent-success/10 hover:border-accent-success/50 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-success focus:ring-offset-2 shadow-lg shadow-accent-success/10 hover:shadow-accent-success/20"
                                >
                                    <FaUser className="w-4 h-4" />
                                    {t('auth.login')}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
