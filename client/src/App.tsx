import { useEffect, useMemo, ReactNode, Suspense } from 'react'
import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from './shared/layouts/Navbar'
import { VisualEffect, LiquidDecoration, ScrollProgress, ErrorBoundary, SplashScreen } from './shared/components'
import { MaintenancePage, TermsPage, PrivacyPage } from './shared/pages'
import { AuthProvider, useAuth } from './shared/contexts/AuthContext'
import { SettingsProvider, useSettings } from './shared/contexts/SettingsContext'
import { ToastProvider } from './shared/contexts/ToastContext'

// Domain imports (lazy-loaded)
import { AuthModal } from './domain/user'
const Home = React.lazy(() => import('./domain/dashboard').then(m => ({ default: m.Home })));
const CV = React.lazy(() => import('./domain/cv').then(m => ({ default: m.CV })));
const Game = React.lazy(() => import('./domain/game').then(m => ({ default: m.Game })));
const MessageWall = React.lazy(() => import('./domain/messagewall').then(m => ({ default: m.MessageWall })));
const SuggestionsPage = React.lazy(() => import('./domain/suggestions').then(m => ({ default: m.SuggestionsPage })));
const CalendarPage = React.lazy(() => import('./domain/calendar').then(m => ({ default: m.CalendarPage })));
const LearningPage = React.lazy(() => import('./domain/vocabulary').then(m => ({ default: m.LearningPage })));
const NotesPage = React.lazy(() => import('./domain/note').then(m => ({ default: m.NotesPage })));
const ProfilePage = React.lazy(() => import('./domain/profile').then(m => ({ default: m.ProfilePage })));

import './App.css'

interface RouteConfig {
    path: string;
    element: ReactNode;
    settingKey?: string;
}

function AppContent() {
    const location = useLocation()
    const { i18n } = useTranslation()

    const { login, isAdmin, isAuthModalOpen, closeAuthModal, adminLogin } = useAuth();

    // Global Settings State - now managed by SettingsContext
    const { isEnabled, settings, isLoading: settingsLoading } = useSettings();

    // Initial Load: i18n only
    useEffect(() => {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && i18n.language !== savedLanguage) {
            i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);



    // Centralized route configuration
    const routes: RouteConfig[] = useMemo(() => [
        { path: '/', element: <Home /> },
        { path: '/cv', element: <CV />, settingKey: 'PAGE_CV_ENABLED' },
        { path: '/game', element: <Game />, settingKey: 'PAGE_GAME_ENABLED' },
        { path: '/messages', element: <MessageWall />, settingKey: 'PAGE_MESSAGES_ENABLED' },
        { path: '/suggestions', element: <SuggestionsPage />, settingKey: 'PAGE_SUGGESTIONS_ENABLED' },
        { path: '/calendar', element: <CalendarPage />, settingKey: 'PAGE_CALENDAR_ENABLED' },
        { path: '/learning', element: <LearningPage />, settingKey: 'PAGE_LEARNING_ENABLED' },
        { path: '/notes', element: <NotesPage />, settingKey: 'PAGE_NOTES_ENABLED' },
        { path: '/profile', element: <ProfilePage /> },
        { path: '/terms', element: <TermsPage /> },
        { path: '/privacy', element: <PrivacyPage /> },
    ], []);

    const maintenanceElement = (
        <MaintenancePage
            message={settings['SITE_MAINTENANCE_MESSAGE']}
            activatedBy={settings['SITE_MAINTENANCE_BY']}
            onAdminLogin={adminLogin}
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
            {/* Optimized loading screen with smooth transition */}
            <AnimatePresence mode="wait">
                {settingsLoading && (
                    <SplashScreen 
                        key="splash"
                        isLoading={true} 
                    />
                )}
            </AnimatePresence>

            {!settingsLoading && (
                <>
                    {!location.pathname.startsWith('/messages') && <ScrollProgress />}

                    <AuthModal
                        isOpen={isAuthModalOpen}
                        onClose={closeAuthModal}
                        onLoginSuccess={login}
                    />

                    {(isEnabled('SITE_MAINTENANCE_MODE') && !isAdmin) ? (
                        maintenanceElement
                    ) : (
                        <>
                            <Navbar />

                            {location.pathname === '/' && (
                                <div className="fixed top-0 left-0 w-full h-screen z-10 pointer-events-none">
                                    <VisualEffect />
                                    <div className="aurora-blob w-[300px] h-[300px] top-[20%] left-[20%] bg-accent-secondary/50" style={{ animationDelay: '0s' }}></div>
                                    <div className="aurora-blob w-[400px] h-[400px] bottom-[20%] right-[20%] bg-accent-info/50" style={{ animationDelay: '2s' }}></div>
                                    <LiquidDecoration className="top-[10%] right-[5%]" size="w-80 h-80" delay={0} />
                                </div>
                            )}

                            <div className="relative z-20">
                                <ErrorBoundary>
                                    <Suspense fallback={<SplashScreen isLoading={true} />}>
                                        <Routes>
                                            {routes.map(route => (
                                                <Route
                                                    key={route.path}
                                                    path={route.path}
                                                    element={renderRoute(route)}
                                                />
                                            ))}
                                        </Routes>
                                    </Suspense>
                                </ErrorBoundary>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <ToastProvider>
                    <Router>
                        <AppContent />
                    </Router>
                </ToastProvider>
            </SettingsProvider>
        </AuthProvider>
    )
}

export default App
