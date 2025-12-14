import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './layouts/Navbar'
import AuthModal from './features/auth/AuthModal'
import { Preloader } from './components/Preloader'
import { VisualEffect } from './components/VisualEffect'
import { LiquidDecoration } from './components/LiquidDecoration'
import { ScrollProgress } from './components/ScrollProgress'
import { Home } from './pages/HomePage'
import { CV } from './pages/CVPage'
import { Game } from './pages/GamePage'
import { MessageWall } from './features/messages/MessageWall'
import { SuggestionsPage } from './pages/SuggestionsPage'
import { CalendarPage } from './pages/CalendarPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ADMIN_CODES, STORAGE_KEYS } from './constants/auth'
import './App.css'

interface User {
    userId: string;
    username: string;
}

function AppContent() {
    const [isDarkMode, setIsDarkMode] = useState(true)
    const toggleTheme = () => setIsDarkMode(!isDarkMode)
    const location = useLocation()

    // Global Auth State
    const [user, setUser] = useState<User | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Sync body background with theme to prevent white flashes on mobile overscroll
    useEffect(() => {
        const color = isDarkMode ? '#050505' : '#f5f5f7';
        document.body.style.backgroundColor = color;
        document.documentElement.style.backgroundColor = color;
    }, [isDarkMode]);

    const handleLogin = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        setShowAuthModal(false); // Close modal on success
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
    };

    // Global Admin State
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const storedAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
        if (storedAdmin === 'true') setIsAdmin(true);

        const storedSuperAdmin = localStorage.getItem(STORAGE_KEYS.IS_SUPER_ADMIN);
        if (storedSuperAdmin === 'true') {
            setIsSuperAdmin(true);
            setIsAdmin(true);
        }
    }, []);

    const handleAdminLogin = (code: string) => {
        if (code === ADMIN_CODES.SUPER_ADMIN) {
            setIsSuperAdmin(true);
            setIsAdmin(true);
            localStorage.setItem(STORAGE_KEYS.IS_SUPER_ADMIN, 'true');
            localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
            return true;
        } else if (code === ADMIN_CODES.ADMIN) {
            setIsAdmin(true);
            localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
            return true;
        }
        return false;
    };

    const handleAdminLogout = () => {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.IS_SUPER_ADMIN);
    };

    return (
        <div className={`relative min-h-screen transition-colors duration-500 font-body ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-gray-900'}`}>
            <Preloader />
            {/* Hide scroll progress on messages page as it has its own scrolling behavior */}
            {!location.pathname.startsWith('/messages') && <ScrollProgress isDarkMode={isDarkMode} />}

            {/* Global Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={handleLogin}
                isDarkMode={isDarkMode}
            />

            <Navbar
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                user={user}
                onOpenLogin={() => setShowAuthModal(true)}
                onLogout={handleLogout}
                isAdmin={isAdmin}
                isSuperAdmin={isSuperAdmin}
                onAdminLogin={handleAdminLogin}
                onAdminLogout={handleAdminLogout}
            />

            {/* Shared Background - Only on Home */}
            {location.pathname === '/' && (
                <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none">
                    <VisualEffect isDarkMode={isDarkMode} />
                    {/* Aurora Blobs */}
                    <div className={`aurora-blob w-[300px] h-[300px] top-[20%] left-[20%] ${isDarkMode ? 'bg-[#4a148c]' : 'bg-[#b2ebf2]'}`} style={{ animationDelay: '0s' }}></div>
                    <div className={`aurora-blob w-[400px] h-[400px] bottom-[20%] right-[20%] ${isDarkMode ? 'bg-[#1a237e]' : 'bg-[#e1bee7]'}`} style={{ animationDelay: '2s' }}></div>
                    <LiquidDecoration isDarkMode={isDarkMode} className="top-[10%] right-[5%]" size="w-80 h-80" delay={0} />
                </div>
            )}

            <div className="relative z-10">
                <Routes>
                    <Route path="/" element={<Home isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/cv" element={<CV isDarkMode={isDarkMode} />} />
                    <Route path="/game" element={<Game isDarkMode={isDarkMode} user={user} onOpenLogin={() => setShowAuthModal(true)} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} />} />
                    <Route path="/messages" element={<MessageWall isDarkMode={isDarkMode} user={user} onOpenLogin={() => setShowAuthModal(true)} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />} />
                    <Route path="/suggestions" element={<SuggestionsPage isDarkMode={isDarkMode} user={user} onOpenLogin={() => setShowAuthModal(true)} isAdmin={isAdmin} />} />
                    <Route path="/calendar" element={<CalendarPage isDarkMode={isDarkMode} isAdmin={isAdmin} />} />
                    <Route path="/terms" element={<TermsPage isDarkMode={isDarkMode} />} />
                    <Route path="/privacy" element={<PrivacyPage isDarkMode={isDarkMode} />} />
                </Routes>
            </div>
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
