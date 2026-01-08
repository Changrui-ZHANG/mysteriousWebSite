/**
 * DesktopMenu - Desktop navigation menu
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaSun, FaMoon, FaCog, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeManager } from '../../hooks/useThemeManager';
import { LanguageButton } from './LanguageButton';

interface DesktopMenuProps {
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

export function DesktopMenu({
    onOpenLogin, onLogout, isAdmin, isSuperAdmin,
    loginCode, setLoginCode, onAdminLogin, onAdminLogout, onShowSiteControls,
    changeLanguage,
}: DesktopMenuProps) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { resolvedTheme, toggleTheme } = useThemeManager();
    const location = useLocation();
    const [showAdminInput, setShowAdminInput] = useState(false);

    const submitAdminCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (onAdminLogin) {
            const success = await onAdminLogin(loginCode);
            if (success) { setLoginCode(''); setShowAdminInput(false); }
            else alert(t('admin.invalid_code'));
        }
    };

    const mainLinks = [
        { to: "/", label: t('nav.home') },
        { to: "/cv", label: t('nav.cv') },
        { to: "/game", label: t('nav.game') },
        { to: "/messages", label: t('nav.messages') }
    ];

    const moreLinks = [
        { to: "/notes", label: t('nav.notes') },
        { to: "/suggestions", label: t('nav.suggestions') },
        { to: "/calendar", label: t('nav.calendar') },
        { to: "/learning", label: t('nav.learning') }
    ];

    return (
        <div className="hidden lg:flex items-center gap-4 font-heading text-sm max-w-full">
            {/* Main Navigation Links */}
            <div className="flex items-center gap-1">
                {mainLinks.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-white/5 ${location.pathname === link.to ? 'text-accent-primary font-bold bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' : 'text-secondary hover:text-primary'}`}
                    >
                        {link.label}
                    </Link>
                ))}

                {/* Dropdown for More Links - Horizontal Liquid Glass Style */}
                <div className="relative group">
                    <button className={`px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-white/5 flex items-center gap-1 uppercase tracking-widest ${['/notes', '/suggestions', '/calendar', '/learning'].includes(location.pathname) ? 'text-accent-primary font-bold bg-white/10' : 'text-secondary hover:text-primary'}`}>
                        {t('nav.more')} <FaChevronDown className="text-[10px] transition-transform duration-300 group-hover:rotate-180" />
                    </button>
                    {/* Invisible bridge to prevent hover gap */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-full h-3 bg-transparent z-40" />
                    {/* Horizontal submenu with same navbar style */}
                    <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl flex items-center gap-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)] after:pointer-events-none">
                        {moreLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`relative z-10 px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-white/5 whitespace-nowrap ${location.pathname === link.to ? 'text-accent-primary font-bold bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' : 'text-secondary hover:text-primary'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-px h-4 bg-white/10" />

            {/* Auth Section */}
            {user ? (
                <div className="flex items-center gap-3">
                    <span className="font-bold text-accent-primary text-xs truncate max-w-[100px]">{user.username}</span>
                    <button onClick={onLogout} className="hover:text-red-400 transition-colors" title={t('auth.logout')}>
                        <FaSignOutAlt className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <button onClick={onOpenLogin} className="flex items-center gap-2 hover:text-accent-primary transition-colors text-xs uppercase tracking-wider font-bold">
                    <FaUser className="w-3 h-3" />
                    <span>{t('auth.login')}</span>
                </button>
            )}

            <div className="w-px h-4 bg-white/10" />

            {/* Admin Section */}
            <div className="relative flex items-center">
                {isAdmin ? (
                    <>
                        <button onClick={onAdminLogout} className={`text-xs px-2 py-1 rounded border ${isSuperAdmin ? 'border-purple-500 text-purple-400' : 'border-green-500 text-green-500'} hover:opacity-80 transition-opacity`} title={t('auth.logout')}>
                            {isSuperAdmin ? t('admin.super_admin') : t('admin.admin')}
                        </button>
                        <button onClick={onShowSiteControls} className="text-xl hover:opacity-60 transition-opacity ml-2" title={t('admin.site_settings')}>
                            <FaCog />
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setShowAdminInput(!showAdminInput)} className="hover:scale-110 transition-transform" title={t('auth.admin_access')}>🔐</button>
                        {showAdminInput && (
                            <form onSubmit={submitAdminCode} className="absolute top-full right-0 mt-2 p-2 rounded-lg shadow-xl z-50 flex gap-2 bg-elevated border border-accent-info/50 backdrop-blur-xl">
                                <input
                                    type="password"
                                    value={loginCode}
                                    onChange={(e) => setLoginCode(e.target.value)}
                                    placeholder={t('admin.code_placeholder')}
                                    className="w-32 px-3 py-1.5 text-xs rounded-md bg-inset border border-current/10 focus:border-accent-info outline-none transition-all font-mono"
                                    autoFocus
                                />
                                <button type="submit" className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded-md font-bold transition-colors shadow-lg shadow-cyan-500/20">→</button>
                            </form>
                        )}
                    </>
                )}
            </div>

            <div className="w-[1px] h-[20px] bg-current opacity-20" />

            {/* Language Buttons */}
            <div className="flex gap-3">
                <LanguageButton lang="en" label="EN" flagCode="gb" currentLang={i18n.language} onClick={changeLanguage} />
                <LanguageButton lang="fr" label="FR" flagCode="fr" currentLang={i18n.language} onClick={changeLanguage} />
                <LanguageButton lang="zh" label="ZH" flagCode="cn" currentLang={i18n.language} onClick={changeLanguage} />
            </div>

            <div className="w-[1px] h-[20px] bg-current opacity-20" />

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-all text-secondary hover:text-primary" title={resolvedTheme === 'dark' ? t('navbar.theme.light') : resolvedTheme === 'light' ? t('navbar.theme.paper') : t('navbar.theme.dark')}>
                {resolvedTheme === 'dark' ? <FaSun className="w-4 h-4" /> : resolvedTheme === 'light' ? <FaMoon className="w-4 h-4" /> : <FaCog className="w-4 h-4" />}
            </button>
        </div>
    );
}
