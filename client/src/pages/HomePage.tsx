import { useEffect, useState } from 'react'
import Lenis from '@studio-freight/lenis'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScrollSection, GravityPlayground, Gallery, TextReveal, TiltCard } from '../components'
import MagneticButton from '../components/ui/MagneticButton'

interface HomeProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export function Home({ isDarkMode }: HomeProps) {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);

    // Smooth Scrolling Setup inside Home
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

    return (
        <div>
            {/* HERRO SECTION */}
            <section className="h-screen flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <h1 className={`text-5xl md:text-8xl m-0 font-heading font-extrabold tracking-tighter ${isDarkMode ? 'drop-shadow-[0_0_40px_rgba(0,0,0,0.5)]' : ''}`}>
                        {t('hero.title')}
                    </h1>
                    <p className="text-2xl opacity-80 font-serif italic mt-4">
                        {t('hero.subtitle')}
                    </p>
                </div>

                <MagneticButton isDarkMode={isDarkMode} onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                    {t('hero.explore')}
                </MagneticButton>
            </section>

            {/* MANIFESTO SECTION - STAGGERED REVEAL */}
            <ScrollSection>
                <h2 className="text-4xl md:text-6xl max-w-4xl text-center font-bold font-heading mx-auto">
                    {t('story.title')}
                </h2>
                <div className="max-w-2xl mx-auto mt-8 text-center">
                    <TextReveal
                        className="flex flex-wrap justify-center text-xl md:text-3xl leading-relaxed opacity-90 font-serif"
                    >
                        {t('story.description')}
                    </TextReveal>
                </div>
            </ScrollSection>

            {/* FEATURES SECTION - 3D TILT CARDS */}
            <ScrollSection>
                <div className="flex gap-12 items-center flex-wrap justify-center px-4">
                    <div className="w-full max-w-[320px] h-[420px]">
                        <TiltCard isDarkMode={isDarkMode} style={{ height: '100%' }}>
                            <h3 className="text-4xl mb-4 font-heading">{t('features.velocity.title')}</h3>
                            <div className="w-[50px] h-[5px] bg-cyan-400 mb-6"></div>
                            <p className="text-lg leading-relaxed opacity-80">{t('features.velocity.description')}</p>
                        </TiltCard>
                    </div>

                    <div className="w-full max-w-[320px] h-[420px] mt-8 md:mt-16">
                        <TiltCard isDarkMode={isDarkMode} style={{ height: '100%' }}>
                            <h3 className="text-4xl mb-4 font-heading">{t('features.depth.title')}</h3>
                            <div className="w-[50px] h-[5px] bg-fuchsia-500 mb-6"></div>
                            <p className="text-lg leading-relaxed opacity-80">{t('features.depth.description')}</p>
                        </TiltCard>
                    </div>

                    <div className="w-full max-w-[320px] h-[420px]">
                        <TiltCard isDarkMode={isDarkMode} style={{ height: '100%' }}>
                            <h3 className="text-4xl mb-4 font-heading">{t('features.light.title')}</h3>
                            <div className="w-[50px] h-[5px] bg-yellow-400 mb-6"></div>
                            <p className="text-lg leading-relaxed opacity-80">{t('features.light.description')}</p>
                        </TiltCard>
                    </div>
                </div>
            </ScrollSection>

            {/* GRAVITY PLAYGROUND MINI-GAME */}
            <ScrollSection>
                <div className="w-full h-screen flex flex-col justify-center px-4">
                    <h2 className="text-4xl md:text-8xl text-center mb-12 font-heading font-bold bg-gradient-to-b from-current to-transparent bg-clip-text text-transparent opacity-80">
                        {t('gravity.title')}
                    </h2>
                    <GravityPlayground isDarkMode={isDarkMode} />
                </div>
            </ScrollSection>

            {/* HORIZONTAL GALLERY PREVIEW */}
            <ScrollSection>
                <div className="w-full py-16">
                    <Gallery isDarkMode={isDarkMode} />
                </div>
            </ScrollSection>

            {/* SIGNATURE SECTION */}
            <ScrollSection>
                <div className="relative">
                    <svg className="absolute w-0 h-0">
                        <filter id="liquid-flow">
                            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" result="warp">
                                <animate attributeName="baseFrequency" dur="10s" values="0.01;0.005;0.01" repeatCount="indefinite" />
                            </feTurbulence>
                            <feDisplacementMap
                                xChannelSelector="R"
                                yChannelSelector="G"
                                scale={isHovered ? 35 : 0}
                                in="SourceGraphic"
                                in2="warp"
                            />
                        </filter>
                    </svg>

                    <motion.h2
                        className="text-5xl md:text-9xl font-black font-heading bg-gradient-to-r from-white/30 via-white/80 to-white/30 bg-clip-text text-transparent text-center p-4 bg-[length:200%_auto] transition-all duration-700"
                        style={{
                            filter: 'url(#liquid-flow) blur(0.5px)',
                            WebkitTextStroke: '1px rgba(255,255,255,0.5)',
                            textShadow: '0 0 15px rgba(255,255,255,0.3)'
                        }}
                        animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {t('signature')}
                    </motion.h2>
                </div>
            </ScrollSection>

            {/* MEGA FOOTER */}
            <footer className={`py-24 px-8 border-t ${isDarkMode ? 'bg-black border-[#222]' : 'bg-gray-100 border-[#ddd]'}`}>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12 max-w-7xl mx-auto">
                    <div>
                        <h4 className="text-2xl mb-6">{t('signature')}.</h4>
                        <p className="opacity-60">{t('footer_section.tagline')}</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">{t('footer_section.socials')}</h4>
                        <ul className="list-none p-0 opacity-70 leading-loose">
                            <li>
                                <a href="https://github.com/Changrui-ZHANG" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/changrui-zhang/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    LinkedIn
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">{t('footer_section.legal')}</h4>
                        <ul className="list-none p-0 opacity-70 leading-loose">
                            <li>
                                <Link to="/privacy" className="hover:text-white transition-colors">
                                    {t('footer_section.privacy')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-white transition-colors">
                                    {t('footer_section.terms')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">{t('footer_section.newsletter')}</h4>
                        <div className="flex">
                            <input type="email" placeholder={t('footer_section.email_placeholder')} className="p-2 rounded-l-md border-none" />
                            <button className="p-2 px-4 bg-white text-black border-none rounded-r-md cursor-pointer font-bold">{t('footer_section.join')}</button>
                        </div>
                    </div>
                </div>
                <div className="text-center opacity-40 mt-16 text-sm">
                    <p>{t('footer_section.copyright')}</p>
                </div>
            </footer>
        </div>
    )
}
