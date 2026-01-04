/**
 * Navbar - Main navigation component
 * Refactored to use sub-components for desktop and mobile menus
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminSiteControls } from '../features/admin/AdminSiteControls';
import { DesktopMenu, MobileMenu } from './navbar/index';

interface User { userId: string; username: string; }

interface NavbarProps {
    user?: User | null;
    onOpenLogin: () => void;
    onLogout?: () => void;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    adminCode?: string;
    onAdminLogin?: (code: string) => Promise<boolean>;
    onAdminLogout?: () => void;
    onRefreshSettings?: () => void;
}

export function Navbar({
    user, onOpenLogin, onLogout,
    isAdmin = false, isSuperAdmin = false, adminCode = '',
    onAdminLogin, onAdminLogout, onRefreshSettings
}: NavbarProps) {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [loginCode, setLoginCode] = useState('');
    const [showSiteControls, setShowSiteControls] = useState(false);

    // Lock background scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        return () => { document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = ''; };
    }, [isOpen]);

    const changeLanguage = async (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('preferredLanguage', lng);
        if (user?.userId) {
            try {
                await fetch(`/api/users/${user.userId}/language`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ language: lng }),
                });
            } catch (error) {
                console.error('Failed to save language preference:', error);
            }
        }
    };

    const getPageTitle = () => {
        const titles: Record<string, string> = {
            '/cv': t('navbar.cv_title'),
            '/game': t('navbar.arcade_title'),
            '/messages': t('navbar.messages_title'),
            '/suggestions': t('navbar.suggestions_title'),
            '/calendar': t('navbar.calendar_title'),
            '/learning': t('navbar.linguist_title'),
        };
        return titles[location.pathname] || t('navbar.title');
    };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-[1000] backdrop-blur-md bg-page/90 text-primary">
                <Link to="/" className="text-xl md:text-2xl font-bold font-heading tracking-tighter hover:opacity-80 transition-opacity z-50 relative">
                    {getPageTitle()}
                </Link>

                {/* Mobile Menu Button */}
                <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden z-50 w-8 h-8 flex flex-col justify-center gap-1.5 focus:outline-none" style={{ position: 'relative', zIndex: 60 }}>
                    <motion.span animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }} className={`w-full h-0.5 block transition-all ${isOpen ? 'bg-white' : 'bg-current'}`} />
                    <motion.span animate={{ opacity: isOpen ? 0 : 1 }} className={`w-full h-0.5 block transition-all ${isOpen ? 'bg-white' : 'bg-current'}`} />
                    <motion.span animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }} className={`w-full h-0.5 block transition-all ${isOpen ? 'bg-white' : 'bg-current'}`} />
                </button>

                <DesktopMenu
                    user={user}
                    onOpenLogin={onOpenLogin}
                    onLogout={onLogout}
                    isAdmin={isAdmin}
                    isSuperAdmin={isSuperAdmin}
                    loginCode={loginCode}
                    setLoginCode={setLoginCode}
                    onAdminLogin={onAdminLogin}
                    onAdminLogout={onAdminLogout}
                    onShowSiteControls={() => setShowSiteControls(true)}
                    changeLanguage={changeLanguage}
                />
            </nav>

            <MobileMenu
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                user={user}
                onOpenLogin={onOpenLogin}
                onLogout={onLogout}
                isAdmin={isAdmin}
                isSuperAdmin={isSuperAdmin}
                loginCode={loginCode}
                setLoginCode={setLoginCode}
                onAdminLogin={onAdminLogin}
                onAdminLogout={onAdminLogout}
                onShowSiteControls={() => setShowSiteControls(true)}
                changeLanguage={changeLanguage}
            />

            <AdminSiteControls
                isOpen={showSiteControls}
                onClose={() => setShowSiteControls(false)}
                adminCode={adminCode || ''}
                onSettingsChange={onRefreshSettings}
                user={user ?? undefined}
                onOpenLogin={onOpenLogin}
            />
        </>
    );
}
