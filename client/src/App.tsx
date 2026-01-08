import { useState, useEffect, useMemo, ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './shared/layouts/Navbar'
import { VisualEffect, LiquidDecoration, ScrollProgress, ErrorBoundary } from './shared/components'
import { MaintenancePage, TermsPage, PrivacyPage } from './shared/pages'
import { AuthProvider, useAuth } from './shared/contexts/AuthContext'
import { fetchJson } from './shared/api/httpClient'
import { API_ENDPOINTS } from './shared/constants/endpoints'
import { useAdmin } from './shared/hooks/useAdmin'

// Domain imports
import { AuthModal } from './domain/user'
import { Home } from './domain/dashboard'
import { CV } from './domain/cv'
import { Game } from './domain/game'
import { MessageWall, SuggestionsPage } from './domain/messagewall'
import { CalendarPage } from './domain/calendar'
import { LearningPage } from './domain/vocabulary'
import { NotesPage } from './domain/note'

import './App.css'

interface RouteConfig {
    path: string;
    element: ReactNode;
    settingKey?: string;
}

function AppContent() {
    const location = useLocation()
    const { i18n } = useTranslation()

    // Centralized Admin State
    const admin = useAdmin();

    // Global Auth State - now managed by AuthContext
    const { user, login, logout } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Global Settings State
    const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Initial Load: Settings only (Auth is handled by AuthContext)
    useEffect(() => {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && i18n.language !== savedLanguage) {
            i18n.changeLanguage(savedLanguage);
        }

        fetchJson<Record<string, string>>(API_ENDPOINTS.SETTINGS.PUBLIC)
            .then(data => {
                setSiteSettings(data);
                setSettingsLoaded(true);
            })
            .catch(err => {
                console.error("Failed to load settings", err);
                setSettingsLoaded(true);
            });
    }, []);

    const handleLogin = (newUser: { userId: string; username: string }) => {
        login(newUser);
        setShowAuthModal(false);
    };

    const handleLogout = () => {
        logout();
    };

    const refreshSettings = () => {
        fetchJson<Record<string, string>>(API_ENDPOINTS.SETTINGS.PUBLIC)
            .then(data => setSiteSettings(data))
            .catch(err => console.error("Failed to refresh settings", err));
    };

    const isEnabled = (key: string) => siteSettings[key] === 'true';
    const openLogin = () => setShowAuthModal(true);

    // Centralized route configuration
    const routes: RouteConfig[] = useMemo(() => [
        { path: '/', element: <Home /> },
        { path: '/cv', element: <CV />, settingKey: 'PAGE_CV_ENABLED' },
        { path: '/game', element: <Game onOpenLogin={openLogin} isSuperAdmin={admin.isSuperAdmin} isAdmin={admin.isAdmin} />, settingKey: 'PAGE_GAME_ENABLED' },
        { path: '/messages', element: <MessageWall user={user} onOpenLogin={openLogin} isAdmin={admin.isAdmin} isSuperAdmin={admin.isSuperAdmin} />, settingKey: 'PAGE_MESSAGES_ENABLED' },
        { path: '/suggestions', element: <SuggestionsPage user={user} onOpenLogin={openLogin} isAdmin={admin.isAdmin} />, settingKey: 'PAGE_SUGGESTIONS_ENABLED' },
        { path: '/calendar', element: <CalendarPage isAdmin={admin.isAdmin} />, settingKey: 'PAGE_CALENDAR_ENABLED' },
        { path: '/learning', element: <LearningPage />, settingKey: 'PAGE_LEARNING_ENABLED' },
        { path: '/notes', element: <NotesPage />, settingKey: 'PAGE_NOTES_ENABLED' },
        { path: '/terms', element: <TermsPage /> },
        { path: '/privacy', element: <PrivacyPage /> },
    ], [admin.isAdmin, admin.isSuperAdmin, user, openLogin]);

    const maintenanceElement = (
        <MaintenancePage
            message={siteSettings['SITE_MAINTENANCE_MESSAGE']}
            activatedBy={siteSettings['SITE_MAINTENANCE_BY']}
            onAdminLogin={admin.login}
        />
    );

    const renderRoute = (route: RouteConfig) => {
        // No settingKey = always enabled (Home, Terms, Privacy)
        if (!route.settingKey) {
            return route.element;
        }
        // Check if page is enabled
        return isEnabled(route.settingKey) ? route.element : maintenanceElement;
    };

    return (
        <div className="page-container relative font-sans">
            {!location.pathname.startsWith('/messages') && <ScrollProgress />}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={handleLogin}
            />

            {(settingsLoaded && isEnabled('SITE_MAINTENANCE_MODE') && !admin.isAdmin) ? (
                maintenanceElement
            ) : (
                <>
                    <Navbar
                        onOpenLogin={openLogin}
                        onLogout={handleLogout}
                        isAdmin={admin.isAdmin}
                        isSuperAdmin={admin.isSuperAdmin}
                        adminCode={admin.adminCode}
                        onAdminLogin={admin.login}
                        onAdminLogout={admin.logout}
                        onRefreshSettings={refreshSettings}
                    />

                    {location.pathname === '/' && (
                        <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none">
                            <VisualEffect />
                            <div className="aurora-blob w-[300px] h-[300px] top-[20%] left-[20%] bg-accent-secondary/30" style={{ animationDelay: '0s' }}></div>
                            <div className="aurora-blob w-[400px] h-[400px] bottom-[20%] right-[20%] bg-accent-info/30" style={{ animationDelay: '2s' }}></div>
                            <LiquidDecoration className="top-[10%] right-[5%]" size="w-80 h-80" delay={0} />
                        </div>
                    )}

                    <div className="relative z-10">
                        <ErrorBoundary>
                            <Routes>
                                {routes.map(route => (
                                    <Route
                                        key={route.path}
                                        path={route.path}
                                        element={renderRoute(route)}
                                    />
                                ))}
                            </Routes>
                        </ErrorBoundary>
                    </div>
                </>
            )}
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    )
}

export default App
