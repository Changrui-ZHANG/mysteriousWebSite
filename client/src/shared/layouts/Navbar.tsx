import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { AdminSiteControls } from '../../domain/user/AdminSiteControls';
import { DesktopMenu, MobileMenu } from './navbar/index';
import { useSettings } from '../contexts/SettingsContext';
import { UserAvatar } from '../components/UserAvatar';

interface NavbarProps {
}

export function Navbar({ }: NavbarProps) {
    const { t } = useTranslation();
    const { user, isAdmin, isSuperAdmin, adminCode, adminLogin, adminLogout, logout, openAuthModal, changeLanguage } = useAuth();
    const { refreshSettings } = useSettings();
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

    const handleChangeLanguage = async (lng: string) => {
        await changeLanguage(lng);
    };

    const getPageTitle = () => {
        const titles: Record<string, string> = {
            '/cv': t('navbar.cv_title'),
            '/game': t('navbar.arcade_title'),
            '/messages': t('navbar.messages_title'),
            '/suggestions': t('navbar.suggestions_title'),
            '/calendar': t('navbar.calendar_title'),
            '/learning': t('navbar.linguist_title'),
            '/notes': t('navbar.notes_title'),
        };
        return titles[location.pathname] || t('navbar.title');
    };

    return (
        <>
            <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-navbar px-6 py-2 rounded-full border border-white/20 bg-surface-translucent/80 backdrop-blur-3xl shadow-2xl flex items-center gap-6 text-primary transition-all duration-500 hover:bg-white/[0.08] hover:border-white/30 after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2)] after:pointer-events-none w-max max-w-[95vw]">
                {/* Mobile Avatar - Left side */}
                {user && (
                    <Link
                        to="/profile"
                        className="lg:hidden w-10 h-10 rounded-full border-2 border-accent-primary/30 bg-surface overflow-hidden hover:border-accent-primary transition-all active:scale-95 shrink-0 relative"
                        aria-label={t('nav.profile')}
                    >
                        <UserAvatar
                            userId={user.userId}
                            alt={user.username}
                            size="md"
                        />
                    </Link>
                )}

                <Link to="/" className="text-lg md:text-xl font-bold font-heading tracking-tighter hover:opacity-80 transition-opacity relative shrink-0">
                    {getPageTitle()}
                </Link>

                <div className="hidden lg:block w-[1px] h-6 bg-white/10 mx-2" />

                {/* Mobile Menu Button - Visible on tablets too if space is tight */}
                <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden z-modal w-8 h-8 flex flex-col justify-center gap-1.5 focus:outline-none relative">
                    <motion.span animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }} className={`w-full h-0.5 block transition-all ${isOpen ? 'bg-white' : 'bg-current font-bold'}`} />
                    <motion.span animate={{ opacity: isOpen ? 0 : 1 }} className={`w-full h-0.5 block transition-all ${isOpen ? 'bg-white' : 'bg-current font-bold'}`} />
                    <motion.span animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }} className={`w-full h-0.5 block transition-all ${isOpen ? 'bg-white' : 'bg-current font-bold'}`} />
                </button>

                <DesktopMenu
                    onOpenLogin={openAuthModal}
                    onLogout={logout}
                    isAdmin={isAdmin}
                    isSuperAdmin={isSuperAdmin}
                    loginCode={loginCode}
                    setLoginCode={setLoginCode}
                    onAdminLogin={adminLogin}
                    onAdminLogout={adminLogout}
                    onShowSiteControls={() => setShowSiteControls(true)}
                    changeLanguage={handleChangeLanguage}
                />
            </nav>

            <MobileMenu
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onOpenLogin={openAuthModal}
                onLogout={logout}
                isAdmin={isAdmin}
                isSuperAdmin={isSuperAdmin}
                loginCode={loginCode}
                setLoginCode={setLoginCode}
                onAdminLogin={adminLogin}
                onAdminLogout={adminLogout}
                onShowSiteControls={() => setShowSiteControls(true)}
                changeLanguage={handleChangeLanguage}
            />

            <AdminSiteControls
                isOpen={showSiteControls}
                onClose={() => setShowSiteControls(false)}
                adminCode={adminCode || ''}
                onSettingsChange={refreshSettings}
                user={user ?? undefined}
                onOpenLogin={openAuthModal}
            />
        </>
    );
}
