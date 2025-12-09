import { useState, useEffect } from 'react'
import { VisualEffect } from './components/VisualEffect'
import { Navbar } from './components/Navbar'
import { ScrollSection } from './components/ScrollSection'
import Lenis from '@studio-freight/lenis'
import { useTranslation } from 'react-i18next'
import './App.css'

import { GravityPlayground } from './components/GravityPlayground'

// New Components
import MagneticButton from './components/MagneticButton'
import { TextReveal } from './components/TextReveal'
import { TiltCard } from './components/TiltCard'
import { ScrollProgress } from './components/ScrollProgress'
import { Preloader } from './components/Preloader'

function App() {
    const [isDarkMode, setIsDarkMode] = useState(true)
    const { t } = useTranslation();

    // Smooth Scrolling Setup
    useEffect(() => {
        const lenis = new Lenis()

        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    const toggleTheme = () => setIsDarkMode(!isDarkMode)

    return (
        <div className={`relative min-h-screen transition-colors duration-500 font-body ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-gray-900'}`}>
            <Preloader />
            <div className="film-grain"></div>
            <ScrollProgress isDarkMode={isDarkMode} />

            <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

            {/* Fixed Background for the whole experience */}
            <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none">
                <VisualEffect isDarkMode={isDarkMode} />
                {/* Aurora Blobs */}
                <div className={`aurora-blob w-[300px] h-[300px] top-[20%] left-[20%] ${isDarkMode ? 'bg-[#4a148c]' : 'bg-[#b2ebf2]'}`} style={{ animationDelay: '0s' }}></div>
                <div className={`aurora-blob w-[400px] h-[400px] bottom-[20%] right-[20%] ${isDarkMode ? 'bg-[#1a237e]' : 'bg-[#e1bee7]'}`} style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Content Layer */}
            <div className="relative z-10">

                {/* HERRO SECTION */}
                <section className="h-screen flex flex-col items-center justify-center">
                    <div className="text-center mb-8">
                        <h1 className={`text-8xl m-0 font-heading font-extrabold tracking-tighter ${isDarkMode ? 'drop-shadow-[0_0_40px_rgba(0,0,0,0.5)]' : ''}`}>
                            {t('hero.title')}
                        </h1>
                        <p className="text-2xl opacity-80 font-serif italic mt-4">
                            {t('hero.subtitle')}
                        </p>
                    </div>

                    <MagneticButton isDarkMode={isDarkMode} onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                        Explore
                    </MagneticButton>
                </section>

                {/* MANIFESTO SECTION - STAGGERED REVEAL */}
                <ScrollSection>
                    <h2 className="text-6xl max-w-4xl text-center font-bold font-heading mx-auto">
                        {t('story.title')}
                    </h2>
                    <div className="max-w-2xl mx-auto mt-8 text-center">
                        <TextReveal
                            className="flex flex-wrap justify-center text-3xl leading-relaxed opacity-90 font-serif"
                        >
                            {t('story.description')}
                        </TextReveal>
                    </div>
                </ScrollSection>

                {/* FEATURES SECTION - 3D TILT CARDS */}
                <ScrollSection>
                    <div className="flex gap-12 items-center flex-wrap justify-center">
                        <div className="w-[320px] h-[420px]">
                            <TiltCard isDarkMode={isDarkMode} style={{ height: '100%' }}>
                                <h3 className="text-4xl mb-4 font-heading">{t('features.velocity.title')}</h3>
                                <div className="w-[50px] h-[5px] bg-cyan-400 mb-6"></div>
                                <p className="text-lg leading-relaxed opacity-80">{t('features.velocity.description')}</p>
                            </TiltCard>
                        </div>

                        <div className="w-[320px] h-[420px] mt-16">
                            <TiltCard isDarkMode={isDarkMode} style={{ height: '100%' }}>
                                <h3 className="text-4xl mb-4 font-heading">{t('features.depth.title')}</h3>
                                <div className="w-[50px] h-[5px] bg-fuchsia-500 mb-6"></div>
                                <p className="text-lg leading-relaxed opacity-80">{t('features.depth.description')}</p>
                            </TiltCard>
                        </div>

                        <div className="w-[320px] h-[420px]">
                            <TiltCard isDarkMode={isDarkMode} style={{ height: '100%' }}>
                                <h3 className="text-4xl mb-4 font-heading">{t('features.light.title')}</h3>
                                <div className="w-[50px] h-[5px] bg-yellow-400 mb-6"></div>
                                <p className="text-lg leading-relaxed opacity-80">{t('features.light.description')}</p>
                            </TiltCard>
                        </div>
                    </div>
                </ScrollSection>



                // ... existing code ...

                {/* GRAVITY PLAYGROUND MINI-GAME */}
                <ScrollSection>
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-5xl text-center mb-8 font-heading font-bold">Interactive Gravity</h2>
                        <GravityPlayground isDarkMode={isDarkMode} />
                    </div>
                </ScrollSection>

                {/* HORIZONTAL GALLERY PREVIEW */}
                <ScrollSection>
                    <div className="overflow-hidden w-full py-16">
                        <div className="flex gap-8 animate-[marquee_20s_linear_infinite]">
                            {/* Just visual blocks to imply a gallery */}
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`min-w-[400px] h-[300px] rounded-2xl flex items-center justify-center text-4xl ${isDarkMode ? 'bg-[#222] text-[#444]' : 'bg-[#ddd] text-[#bbb]'}`}>
                                    ARTWORK {i}
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollSection>

                {/* SIGNATURE SECTION */}
                <ScrollSection>
                    <h2 className="text-9xl font-black font-heading bg-gradient-to-tr from-[#FF6B6B] to-[#4ECDC4] bg-clip-text text-transparent">
                        {t('signature')}
                    </h2>
                </ScrollSection>

                {/* MEGA FOOTER */}
                <footer className={`py-24 px-8 border-t ${isDarkMode ? 'bg-black border-[#222]' : 'bg-gray-100 border-[#ddd]'}`}>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12 max-w-7xl mx-auto">
                        <div>
                            <h4 className="text-2xl mb-6">Changrui.</h4>
                            <p className="opacity-60">Redefining digital interactions through code and motion.</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Socials</h4>
                            <ul className="list-none p-0 opacity-70 leading-loose">
                                <li>Twitter / X</li>
                                <li>GitHub</li>
                                <li>LinkedIn</li>
                                <li>Instagram</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Legal</h4>
                            <ul className="list-none p-0 opacity-70 leading-loose">
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Newsletter</h4>
                            <div className="flex">
                                <input type="email" placeholder="Email" className="p-2 rounded-l-md border-none" />
                                <button className="p-2 px-4 bg-white text-black border-none rounded-r-md cursor-pointer font-bold">Join</button>
                            </div>
                        </div>
                    </div>
                    <div className="text-center opacity-40 mt-16 text-sm">
                        <p>{t('footer')}</p>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default App
