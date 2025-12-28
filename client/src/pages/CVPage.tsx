import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Canvas } from '@react-three/fiber';
import { getCVData } from '../data/cvData';
import { LiquidSphere } from '../components/cv/LiquidSphere';
import { GlassPanel } from '../components/ui/GlassPanel';
import { ExperienceCard } from '../components/cv/ExperienceCard';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface CVProps {
    isDarkMode: boolean;
}

export function CV({ isDarkMode }: CVProps) {
    const { t } = useTranslation();
    const [currentExpIndex, setCurrentExpIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalSectionRef = useRef<HTMLElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Get Data
    const { skills, experiences, education } = useMemo(() => getCVData(t), [t]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            // LiquidGlass Parallax Effects
            gsap.to('.glass-blobs div', {
                yPercent: -20,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 2
                }
            });
        });

        return () => mm.revert();
    }, { scope: containerRef });

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Slider Animation
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const viewportWidth = window.innerWidth;
            const totalWidth = container.scrollWidth;

            // Get dynamic metrics from the DOM
            const item = container.querySelector('.exp-card-wrapper') as HTMLElement;
            const style = window.getComputedStyle(container);
            const gap = parseFloat(style.gap) || 0;

            const cardWidth = item ? item.offsetWidth + gap : 0;

            // maxScroll should be exactly when the right edge of the container (including padding) 
            // hits the right edge of the viewport.
            const maxScroll = Math.max(0, totalWidth - viewportWidth);

            let xPos = -currentExpIndex * cardWidth;

            // Clamp: If moving to the next item would cause us to show empty space at the end,
            // we stop at maxScroll.
            if (Math.abs(xPos) > maxScroll) {
                xPos = -maxScroll;
            }

            // Ensure we never over-scroll to the right (left edge should be <= 0)
            xPos = Math.min(0, xPos);

            gsap.to(container, {
                x: xPos,
                duration: 0.8,
                ease: "expo.out",
                overwrite: true
            });
        }
    }, [currentExpIndex, windowWidth, experiences.length]);

    const nextExp = () => {
        setCurrentExpIndex((prev: number) => Math.min(prev + 1, experiences.length - 1));
    };

    const prevExp = () => {
        setCurrentExpIndex((prev: number) => Math.max(prev - 1, 0));
    };

    return (
        <div
            ref={containerRef}
            className={`min-h-screen transition-colors duration-1000 overflow-x-hidden ${isDarkMode ? 'bg-[#0a0a0b] text-white' : 'bg-[#fcfcfd] text-[#1d1d1f]'}`}
        >
            {/* Background Aesthetic Layers */}
            <div className="fixed inset-0 pointer-events-none opacity-30 blur-[100px] overflow-hidden glass-blobs">
                <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full ${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-200/40'}`}></div>
                <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100/40'}`}></div>
            </div>

            {/* 1. LiquidGlass Hero Cover */}
            <header className="h-[110vh] flex flex-col items-center justify-center relative overflow-hidden px-6">
                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                        <LiquidSphere isDarkMode={isDarkMode} />
                    </Canvas>
                </div>

                <div className="relative z-10 text-center space-y-8">
                    <div className={`inline-block px-6 py-2 rounded-full border text-xs font-mono tracking-[0.3em] uppercase ${isDarkMode ? 'border-blue-500/30 bg-blue-500/5 text-blue-400' : 'border-blue-500/20 bg-blue-50 text-blue-600'
                        }`}>
                        {t('cv.interactive_portfolio')}
                    </div>
                    <h1 className="text-8xl sm:text-[160px] font-black tracking-tighter leading-none mb-4 mix-blend-difference">
                        {t('cv.name')}
                    </h1>
                    <p className={`text-2xl sm:text-4xl font-medium tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('cv.role')}
                    </p>
                    <div className="pt-12 flex justify-center gap-6">
                        <div className="w-px h-24 bg-gradient-to-b from-blue-500 to-transparent"></div>
                    </div>
                </div>
            </header>

            {/* 2. Experience Section (Interactive Slider) */}
            <section ref={horizontalSectionRef} className="py-32 bg-transparent relative overflow-hidden flex flex-col">
                <div className="px-6 sm:px-20 z-20 mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                    <div className="space-y-4">
                        <h2 className="text-sm font-mono tracking-[0.4em] uppercase text-blue-500 font-bold">{t('cv.work_history')}</h2>
                        <h3 className="text-5xl sm:text-7xl font-black tracking-tighter">{t('cv.experience_gallery')}</h3>
                    </div>

                    <div className="hidden md:block">
                        {/* Empty space for alignment, buttons moved to sides */}
                    </div>
                </div>

                <div className="relative group/gallery">
                    {/* Side Navigation Buttons (Desktop) */}
                    <div className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 z-30 hidden md:block">
                        <button
                            onClick={prevExp}
                            disabled={currentExpIndex === 0}
                            className={`p-6 rounded-full border backdrop-blur-3xl transition-all hover:scale-110 active:scale-95 shadow-2xl ${currentExpIndex === 0 ? 'opacity-20 cursor-not-allowed' : ''
                                } ${isDarkMode ? 'bg-black/40 border-white/10 hover:bg-black/60 text-white' : 'bg-white/80 border-slate-200 hover:bg-white text-slate-800'
                                }`}
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    </div>
                    <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 z-30 hidden md:block">
                        <button
                            onClick={nextExp}
                            disabled={currentExpIndex === experiences.length - 1}
                            className={`p-6 rounded-full border backdrop-blur-3xl transition-all hover:scale-110 active:scale-95 shadow-2xl ${currentExpIndex === experiences.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
                                } ${isDarkMode ? 'bg-black/40 border-white/10 hover:bg-black/60 text-white' : 'bg-white/80 border-slate-200 hover:bg-white text-slate-800'
                                }`}
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-12 px-6 sm:px-20 items-stretch"
                        style={{ width: 'fit-content' }}
                    >
                        {experiences.map((exp, index) => (
                            <div key={index} className="exp-card-wrapper flex-shrink-0 w-[85vw] sm:w-[500px] transition-all duration-700 flex">
                                <ExperienceCard exp={exp} isDarkMode={isDarkMode} />
                            </div>
                        ))}
                    </div>

                    {/* Mobile Navigation Buttons */}
                    <div className="flex justify-center gap-6 mt-12 md:hidden">
                        <button
                            onClick={prevExp}
                            disabled={currentExpIndex === 0}
                            className={`p-4 rounded-full border backdrop-blur-xl transition-all shadow-lg ${currentExpIndex === 0 ? 'opacity-20 cursor-not-allowed' : ''
                                } ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={nextExp}
                            disabled={currentExpIndex === experiences.length - 1}
                            className={`p-4 rounded-full border backdrop-blur-xl transition-all shadow-lg ${currentExpIndex === experiences.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
                                } ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* 3. Bento Layer (LiquidGlass Specifications) */}
            <section className="py-40 px-6 max-w-7xl mx-auto space-y-32">
                <div className="space-y-8">
                    <h2 className="text-sm font-mono tracking-[0.4em] uppercase text-blue-500 font-bold">{t('cv.core_components')}</h2>
                    <h3 className="text-6xl sm:text-[100px] font-black tracking-tighter leading-none mb-4">{t('cv.specifications')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[300px]">
                    <GlassPanel className="md:col-span-8 md:row-span-2 p-12 rounded-[50px] flex flex-col" isDarkMode={isDarkMode}>
                        <h3 className="text-sm font-mono tracking-[0.2em] text-blue-500 uppercase mb-12 font-bold">{t('cv.full_stack_architecture')}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
                            {Object.entries(skills).map(([category, items]) => (
                                <div key={category} className="space-y-6">
                                    <h4 className={`text-xs font-mono uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{category}</h4>
                                    <div className={`space-y-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                        {items.map((s, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-xl text-blue-500">{s.icon}</span>
                                                <p className="text-lg font-light">{s.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>

                    <GlassPanel className="md:col-span-4 p-12 rounded-[50px] bg-blue-600 !border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.4)] flex flex-col justify-between" isDarkMode={isDarkMode}>
                        <h4 className="text-sm font-mono tracking-[0.2em] text-white/60 uppercase font-bold">{t('cv.masters_degree')}</h4>
                        <div className="text-white relative z-10">
                            <div className="text-4xl mb-4 text-blue-300 opacity-50 absolute right-0 top-0">{education[0].icon}</div>
                            <h5 className="text-3xl font-black leading-tight mb-2 uppercase">{education[0].school}</h5>
                            <p className="text-white/80 text-lg uppercase tracking-wider">{education[0].degree}</p>
                        </div>
                    </GlassPanel>

                    <GlassPanel className="md:col-span-4 p-12 rounded-[50px] flex flex-col justify-between overflow-hidden relative" isDarkMode={isDarkMode}>
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 bg-blue-500`}></div>
                        <h4 className="text-sm font-mono tracking-[0.2em] text-blue-500 uppercase font-bold">{t('cv.bachelors_degree')}</h4>
                        <div className="relative z-10">
                            <div className="text-4xl mb-4 text-blue-500 opacity-20 absolute right-0 top-0">{education[1].icon}</div>
                            <h5 className={`text-2xl font-black leading-tight mb-2 uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{education[1].school}</h5>
                            <p className={`text-lg font-light ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{education[1].degree}</p>
                        </div>
                    </GlassPanel>

                    <GlassPanel className="md:col-span-12 p-12 rounded-[60px] flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group" isDarkMode={isDarkMode}>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000"></div>
                        <div className="text-center md:text-left">
                            <h3 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4">{t('cv.initiate_connect')}</h3>
                            <p className={`text-2xl font-light ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('cv.connect_description')}</p>
                        </div>
                        <div className="flex gap-6 shrink-0 z-10">
                            <a href="mailto:m.zhang.changrui@gmail.com" className="px-12 py-5 bg-blue-600 text-white rounded-full text-xl font-bold shadow-2xl hover:bg-blue-700 hover:scale-105 transition-all">{t('cv.direct_mail')}</a>
                            <a href="https://linkedin.com/in/changrui-zhang" className={`px-12 py-5 border rounded-full text-xl font-bold hover:scale-105 transition-all ${isDarkMode ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}>{t('cv.linkedin')}</a>
                        </div>
                    </GlassPanel>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 text-center opacity-30">
                <p className="text-xs font-mono uppercase tracking-[0.5em]">
                    {t('cv.system_status')} • C.ZHANG © {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}

export default CV;
