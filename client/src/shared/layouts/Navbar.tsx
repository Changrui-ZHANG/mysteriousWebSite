import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { AdminSiteControls } from '../../domain/user/AdminSiteControls';
import { UserAvatar } from '../components/UserAvatar';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { DesktopMenu, MobileMenu } from './navbar/index';

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
    const [isMoreOpen, setIsMoreOpen] = useState(false);

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

    const moreLinks = [
        { to: "/profile", label: t('nav.profile') },
        { to: "/notes", label: t('nav.notes') },
        { to: "/suggestions", label: t('nav.suggestions') },
        { to: "/calendar", label: t('nav.calendar') },
        { to: "/learning", label: t('nav.learning') }
    ];

    return (
        <>
            <nav className="absolute top-0 left-0 right-0 z-navbar px-6 py-3 border-b border-white/10 bg-surface-translucent/80 backdrop-blur-3xl shadow-md flex flex-col text-primary transition-all duration-300 w-full">
                <div className="w-full flex items-center justify-between">
                {/* Left Side Group */}
                <div className="flex items-center gap-4">
                    {/* Mobile Avatar - Left side */}
                    {user && (
                        <Link
                            to="/profile"
                            className="lg:hidden w-8 h-8 rounded-full border-2 border-accent-primary/30 bg-surface overflow-hidden hover:border-accent-primary transition-all active:scale-95 shrink-0 relative"
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

                    <div className="hidden lg:block w-[1px] h-5 bg-white/10 mx-2" />
                </div>

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
                        onToggleMore={() => setIsMoreOpen(!isMoreOpen)}
                        isMoreOpen={isMoreOpen}
                    />
                </div>

                {/* Secondary Row - More Menu */}
                <motion.div
                    initial={false}
                    animate={{ height: isMoreOpen ? 'auto' : 0, opacity: isMoreOpen ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden w-full"
                >
                    <div className="pt-4 pb-1 pl-12 flex items-center gap-2 border-t border-white/5 mt-3">
                        {moreLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`px-4 py-1.5 text-xs rounded-full transition-all duration-300 font-heading bg-white/5 hover:bg-white/10 ${location.pathname === link.to ? 'text-accent-primary font-bold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]' : 'text-secondary hover:text-primary'}`}
                                onClick={() => setIsMoreOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </motion.div>
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
