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
import { STORAGE_KEYS } from './constants/auth'
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

    const handleAdminLogin = async (code: string) => {
        try {
            // Updated to use server-side verification via postJson
            // We use require AuthModal or Navbar to handle the async nature, 
            // but here we just need to update the state if successful.
            // Actually, handleAdminLogin is passed to Navbar -> AdminLoginModal.
            // Ideally, the API call should happen there, or this function needs to return a Promise.

            // However, looking at Navbar usage, it might expect a boolean return synchronously?
            // Let's check Navbar usage. 
            // Wait, if I change this signature, I might break Navbar.
            // But for security, I MUST change it to async.

            /* 
               Directly calling the API here.
               NOTE: The original function returned boolean synchronously. 
               We must change it to return Promise<boolean>.
            */

            const { postJson } = await import('./utils/api');
            // Dynamic import or move usage. Since we are in App.tsx, we can import at top level, 
            // but let's just use the fetch logic here or simpler: use the one in api.ts

            const response = await postJson<{ role: string; message: string }>('/api/auth/verify-admin', { code });

            if (response.role === 'super_admin') {
                setIsSuperAdmin(true);
                setIsAdmin(true);
                localStorage.setItem(STORAGE_KEYS.IS_SUPER_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
                return true;
            } else if (response.role === 'admin') {
                setIsAdmin(true);
                localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
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
