import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Preloader } from './components/Preloader'
import { VisualEffect } from './components/VisualEffect'
import { LiquidDecoration } from './components/LiquidDecoration'
import { ScrollProgress } from './components/ScrollProgress'
import { Home } from './components/Home'
import { CV } from './components/CV'
import './App.css'

function AppContent() {
    const [isDarkMode, setIsDarkMode] = useState(true)
    const toggleTheme = () => setIsDarkMode(!isDarkMode)

    return (
        <div className={`relative min-h-screen transition-colors duration-500 font-body ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-gray-900'}`}>
            <Preloader />
            <ScrollProgress isDarkMode={isDarkMode} />

            <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

            {/* Shared Background */}
            <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none">
                <VisualEffect isDarkMode={isDarkMode} />
                {/* Aurora Blobs - Conditionally render or keep for consistency */}
                <div className={`aurora-blob w-[300px] h-[300px] top-[20%] left-[20%] ${isDarkMode ? 'bg-[#4a148c]' : 'bg-[#b2ebf2]'}`} style={{ animationDelay: '0s' }}></div>
                <div className={`aurora-blob w-[400px] h-[400px] bottom-[20%] right-[20%] ${isDarkMode ? 'bg-[#1a237e]' : 'bg-[#e1bee7]'}`} style={{ animationDelay: '2s' }}></div>
                <LiquidDecoration isDarkMode={isDarkMode} className="top-[10%] right-[5%]" size="w-80 h-80" delay={0} />
            </div>

            <div className="relative z-10">
                <Routes>
                    <Route path="/" element={<Home isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
                    <Route path="/cv" element={<CV isDarkMode={isDarkMode} />} />
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
