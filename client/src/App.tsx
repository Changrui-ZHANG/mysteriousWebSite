import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from './layouts/Navbar'
import AuthModal from './features/auth/AuthModal'
import { Preloader, VisualEffect, LiquidDecoration, ScrollProgress, ErrorBoundary } from './components'
import { Home } from './pages/HomePage'
import { CV } from './pages/CVPage'
import { Game } from './pages/GamePage'
import { MessageWall } from './features/messages/MessageWall'
import { SuggestionsPage } from './pages/SuggestionsPage'
import { CalendarPage } from './pages/CalendarPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { LearningPage } from './pages/LearningPage'
import { STORAGE_KEYS } from './constants/authStorage'
import { useThemeManager } from './hooks/useThemeManager'
import { postJson, fetchJson } from './api/httpClient'
import { API_ENDPOINTS } from './constants/endpoints'
import './App.css'

interface User {
    userId: string;
    username: string;
}

function AppContent() {
    const { isDarkMode, toggleTheme } = useThemeManager();
    const location = useLocation()
    const { i18n } = useTranslation()

    // Global Auth State
    const [user, setUser] = useState<User | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Global Settings State
    const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Initial Load: Auth, Language, and Settings
    useEffect(() => {
        // 1. Load Auth
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // Fetch user's language preference from database ONLY ONCE on mount
            fetch(`/api/users/${parsedUser.userId}/language`)
                .then(res => res.json())
                .then(data => {
                    if (data.language && i18n.language !== data.language) {
                        i18n.changeLanguage(data.language);
                        localStorage.setItem('preferredLanguage', data.language);
                    }
                })
                .catch(err => console.error('Failed to load language preference:', err));
        } else {
            // Load language from localStorage if not logged in
            const savedLanguage = localStorage.getItem('preferredLanguage');
            if (savedLanguage && i18n.language !== savedLanguage) {
                i18n.changeLanguage(savedLanguage);
            }
        }

        // 2. Fetch public settings
        fetchJson<Record<string, string>>(API_ENDPOINTS.SETTINGS.PUBLIC)
            .then(data => {
                setSiteSettings(data);
                setSettingsLoaded(true);
            })
            .catch(err => {
                console.error("Failed to load settings", err);
                setSettingsLoaded(true);
            });
    }, []); // Only run once on mount

    const handleLogin = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        setShowAuthModal(false);

        // Fetch and apply user's language preference immediately
        fetch(`/api/users/${newUser.userId}/language`)
            .then(res => res.json())
            .then(data => {
                if (data.language) {
                    i18n.changeLanguage(data.language);
                    localStorage.setItem('preferredLanguage', data.language);
                }
            })
            .catch(err => console.error('Failed to load language preference:', err));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
    };

    // Global Admin State
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [adminCode, setAdminCode] = useState('');

    useEffect(() => {
        const storedAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
        if (storedAdmin === 'true') setIsAdmin(true);

        const storedSuperAdmin = localStorage.getItem(STORAGE_KEYS.IS_SUPER_ADMIN);
        if (storedSuperAdmin === 'true') {
            setIsSuperAdmin(true);
            setIsAdmin(true);
        }

        const storedCode = localStorage.getItem(STORAGE_KEYS.ADMIN_CODE);
        if (storedCode) setAdminCode(storedCode);
    }, []);

    const handleAdminLogin = async (code: string) => {
        try {
            const response = await postJson<{ role: string; message: string }>('/api/auth/verify-admin', { code });

            if (response.role === 'super_admin') {
                setIsSuperAdmin(true);
                setIsAdmin(true);
                setAdminCode(code);
                localStorage.setItem(STORAGE_KEYS.IS_SUPER_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.ADMIN_CODE, code);
                return true;
            } else if (response.role === 'admin') {
                setIsAdmin(true);
                setAdminCode(code);
                localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.ADMIN_CODE, code);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Admin login failed", error);
            return false;
        }
    };

    const handleAdminLogout = () => {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminCode('');
        localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.IS_SUPER_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_CODE);
    };

    const isEnabled = (key: string) => siteSettings[key] === 'true';

    return (
        <div className="page-container relative font-[var(--font-body)]">
            <Preloader isDarkMode={isDarkMode} />
            {!location.pathname.startsWith('/messages') && <ScrollProgress isDarkMode={isDarkMode} />}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={handleLogin}
            />

            {(settingsLoaded && isEnabled('SITE_MAINTENANCE_MODE') && !isAdmin) ? (
                <MaintenancePage
                    message={siteSettings['SITE_MAINTENANCE_MESSAGE']}
                    activatedBy={siteSettings['SITE_MAINTENANCE_BY']}
                    onAdminLogin={handleAdminLogin}
                />
            ) : (
                <>
                    <Navbar
                        isDarkMode={isDarkMode}
                        toggleTheme={toggleTheme}
                        user={user}
                        onOpenLogin={() => setShowAuthModal(true)}
                        onLogout={handleLogout}
                        isAdmin={isAdmin}
                        isSuperAdmin={isSuperAdmin}
                        adminCode={adminCode}
                        onAdminLogin={handleAdminLogin}
                        onAdminLogout={handleAdminLogout}
                        onRefreshSettings={() => {
                            fetchJson<Record<string, string>>(API_ENDPOINTS.SETTINGS.PUBLIC)
                                .then(data => setSiteSettings(data))
                                .catch(err => console.error("Failed to refresh settings", err));
                        }}
                    />

                    {location.pathname === '/' && (
                        <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none">
                            <VisualEffect isDarkMode={isDarkMode} />
                            <div className="aurora-blob w-[300px] h-[300px] top-[20%] left-[20%] bg-[var(--color-accent-purple)]/30" style={{ animationDelay: '0s' }}></div>
                            <div className="aurora-blob w-[400px] h-[400px] bottom-[20%] right-[20%] bg-[var(--color-accent-cyan)]/30" style={{ animationDelay: '2s' }}></div>
                            <LiquidDecoration isDarkMode={isDarkMode} className="top-[10%] right-[5%]" size="w-80 h-80" delay={0} />
                        </div>
                    )}

                    <div className="relative z-10">
                        <ErrorBoundary>
                            <Routes>
                                <Route path="/" element={<Home isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
                                <Route path="/cv" element={isEnabled('PAGE_CV_ENABLED') ? <CV isDarkMode={isDarkMode} /> : <MaintenancePage message={siteSettings['SITE_MAINTENANCE_MESSAGE']} activatedBy={siteSettings['SITE_MAINTENANCE_BY']} onAdminLogin={handleAdminLogin} />} />
                                <Route path="/game" element={isEnabled('PAGE_GAME_ENABLED') ? <Game isDarkMode={isDarkMode} user={user} onOpenLogin={() => setShowAuthModal(true)} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} /> : <MaintenancePage message={siteSettings['SITE_MAINTENANCE_MESSAGE']} activatedBy={siteSettings['SITE_MAINTENANCE_BY']} onAdminLogin={handleAdminLogin} />} />
                                <Route path="/messages" element={isEnabled('PAGE_MESSAGES_ENABLED') ? <MessageWall isDarkMode={isDarkMode} user={user} onOpenLogin={() => setShowAuthModal(true)} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} /> : <MaintenancePage message={siteSettings['SITE_MAINTENANCE_MESSAGE']} activatedBy={siteSettings['SITE_MAINTENANCE_BY']} onAdminLogin={handleAdminLogin} />} />
                                <Route path="/suggestions" element={isEnabled('PAGE_SUGGESTIONS_ENABLED') ? <SuggestionsPage isDarkMode={isDarkMode} user={user} onOpenLogin={() => setShowAuthModal(true)} isAdmin={isAdmin} /> : <MaintenancePage message={siteSettings['SITE_MAINTENANCE_MESSAGE']} activatedBy={siteSettings['SITE_MAINTENANCE_BY']} onAdminLogin={handleAdminLogin} />} />
                                <Route path="/calendar" element={isEnabled('PAGE_CALENDAR_ENABLED') ? <CalendarPage isAdmin={isAdmin} /> : <MaintenancePage message={siteSettings['SITE_MAINTENANCE_MESSAGE']} activatedBy={siteSettings['SITE_MAINTENANCE_BY']} onAdminLogin={handleAdminLogin} />} />
                                <Route path="/learning" element={<LearningPage />} />
                                <Route path="/terms" element={<TermsPage />} />
                                <Route path="/privacy" element={<PrivacyPage />} />
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
        <Router>
            <AppContent />
        </Router>
    )
}

export default App
