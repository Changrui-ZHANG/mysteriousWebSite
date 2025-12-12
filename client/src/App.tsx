import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import AuthModal from './components/AuthModal'
import { Preloader } from './components/Preloader'
import { VisualEffect } from './components/VisualEffect'
import { LiquidDecoration } from './components/LiquidDecoration'
import { ScrollProgress } from './components/ScrollProgress'
import { Home } from './components/Home'
import { CV } from './components/CV'
import { Game } from './components/Game'
import { MessageWall } from './components/MessageWall'
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
        const storedUser = localStorage.getItem('messageWall_user');
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
        localStorage.setItem('messageWall_user', JSON.stringify(newUser));
        setShowAuthModal(false); // Close modal on success
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('messageWall_user');
    };

    return (
        <div className={`relative min-h-screen transition-colors duration-500 font-body ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-gray-900'}`}>
            <Preloader />
            {location.pathname !== '/messages' && <ScrollProgress isDarkMode={isDarkMode} />}

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
                    <Route path="/game" element={<Game isDarkMode={isDarkMode} user={user} onOpenLogin={() => setShowAuthModal(true)} />} />
                    <Route path="/messages" element={<MessageWall isDarkMode={isDarkMode} user={user} />} />
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
