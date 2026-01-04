import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getCVData } from '../data/cvData';
import { ExperienceCard } from '../features/cv/components';
import { AuroraCard } from '../components/ui/AuroraCard';
import { SOCIAL_LINKS } from '../constants/urls';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface CVProps { }

export function CV({ }: CVProps) {
    const { t } = useTranslation();
    const [currentExpIndex, setCurrentExpIndex] = useState(0);
    const [maxIndex, setMaxIndex] = useState(0); // Maximum valid index based on viewport
    const [isPaperTheme, setIsPaperTheme] = useState(() => {
        const saved = localStorage.getItem('cv-paper-theme');
        return saved === 'true';
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const horizontalSectionRef = useRef<HTMLElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Get Data
    const { skills, experiences, education } = useMemo(() => getCVData(t), [t]);

    // Save paper theme preference to localStorage
    useEffect(() => {
        localStorage.setItem('cv-paper-theme', String(isPaperTheme));
    }, [isPaperTheme]);

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

            // Calculate max index based on visible width
            // We want the last possible index where the scroll position doesn't exceed visual bounds
            const calculatedMaxIndex = cardWidth > 0 ? Math.ceil(maxScroll / cardWidth) : experiences.length - 1;
            const safeMaxIndex = Math.max(0, Math.min(calculatedMaxIndex, experiences.length - 1));

            // Update maxIndex state only if changed to avoid loops
            if (maxIndex !== safeMaxIndex) {
                setMaxIndex(safeMaxIndex);
            }

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
    }, [currentExpIndex, windowWidth, experiences.length, maxIndex]);

    const nextExp = () => {
        if (experiences.length === 0) return;
        setCurrentExpIndex((prev) => Math.min(prev + 1, maxIndex));
    };

    const prevExp = () => {
        if (experiences.length === 0) return;
        setCurrentExpIndex((prev) => Math.max(prev - 1, 0));
    };

    return (
        <div
            ref={containerRef}
            className={`page-container overflow-x-hidden ${isPaperTheme ? 'paper-theme' : ''}`}
        >
            {/* Paper Theme Toggle Button */}
            <button
                onClick={() => setIsPaperTheme(!isPaperTheme)}
                className={`fixed top-24 right-6 z-50 px-6 py-3 rounded-full border-2 backdrop-blur-xl transition-all hover:scale-105 shadow-xl font-medium ${isPaperTheme ? 'paper-border-sm paper-bg paper-text text-letterpress' : 'border-white/20 bg-white/10'}`}
                style={isPaperTheme ? {
                    boxShadow: 'inset 0 1px 0 rgba(255, 240, 210, 0.4), 0 4px 12px rgba(80, 50, 20, 0.25)',
                    filter: 'url(#leatherTextTexture)'
                } : undefined}
            >
                📜 {isPaperTheme ? t('navbar.theme.modern') : t('navbar.theme.paper')}
            </button>

            {/* Leather/Parchment Texture Background - only when paper theme is active */}
            {isPaperTheme && (
                <>
                    <div
                        className="absolute inset-0 pointer-events-none z-0 paper-bg"
                        style={{ minHeight: '100%' }}
                    />
                    {/* 3D Leather texture with lighting */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '100%' }}>
                        <defs>
                            {/* Main leather bumps */}
                            <filter id="leather3D" x="0%" y="0%" width="100%" height="100%">
                                <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="5" seed="10" result="bump" />
                                <feDiffuseLighting in="bump" lightingColor="#e5d4b8" surfaceScale="8" result="light">
                                    <feDistantLight azimuth="135" elevation="45" />
                                </feDiffuseLighting>
                            </filter>
                            {/* Fine grain detail */}
                            <filter id="fineDetail">
                                <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" />
                                <feColorMatrix type="saturate" values="0" />
                            </filter>
                            {/* Leather texture for text - matches background texture with enhanced depth */}
                            <filter id="leatherTextTexture" x="-20%" y="-20%" width="140%" height="140%">
                                {/* Same noise as background leather */}
                                <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="5" seed="10" result="noise" />
                                {/* Enhanced 3D lighting with more depth */}
                                <feDiffuseLighting in="noise" lightingColor="#e5d4b8" surfaceScale="12" diffuseConstant="1.5" result="lighting">
                                    <feDistantLight azimuth="135" elevation="45" />
                                </feDiffuseLighting>
                                {/* Clip to text shape */}
                                <feComposite in="lighting" in2="SourceAlpha" operator="in" result="litTexture" />
                                {/* Blend with text color */}
                                <feBlend in="litTexture" in2="SourceGraphic" mode="multiply" />
                            </filter>
                        </defs>
                        {/* Main leather texture */}
                        <rect width="100%" height="100%" filter="url(#leather3D)" opacity="0.6" />
                        {/* Fine grain for detail */}
                        <rect width="100%" height="100%" filter="url(#fineDetail)" opacity="0.12" />
                    </svg>
                    {/* Vignette overlay - oxidized/aged edges on all borders */}
                    <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                            background: `
                                linear-gradient(to right, rgba(20,10,0,0.6) 0%, rgba(80,50,10,0.4) 2%, rgba(160,100,30,0.2) 5%, rgba(180,130,50,0.1) 8%, transparent 12%),
                                linear-gradient(to left, rgba(20,10,0,0.6) 0%, rgba(80,50,10,0.4) 2%, rgba(160,100,30,0.2) 5%, rgba(180,130,50,0.1) 8%, transparent 12%),
                                linear-gradient(to bottom, rgba(20,10,0,0.6) 0%, rgba(80,50,10,0.4) 1%, rgba(160,100,30,0.2) 2.5%, rgba(180,130,50,0.1) 4%, transparent 6%),
                                linear-gradient(to top, rgba(20,10,0,0.6) 0%, rgba(80,50,10,0.4) 1%, rgba(160,100,30,0.2) 2.5%, rgba(180,130,50,0.1) 4%, transparent 6%)
                            `,
                            minHeight: '100%'
                        }}
                    />
                </>
            )}

            {/* Background Aesthetic Layers - hidden in paper theme */}
            {!isPaperTheme && (
                <div className="fixed inset-0 pointer-events-none opacity-30 blur-[100px] overflow-hidden glass-blobs">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-info opacity-20"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-secondary opacity-20"></div>
                </div>
            )}

            {/* 1. Hero Cover */}
            <header className="h-[110vh] flex flex-col items-center justify-center relative overflow-hidden px-6 z-10">
                <div className="relative z-10 text-center space-y-8">
                    <div
                        className={`inline-block px-6 py-2 rounded-full text-xs font-mono tracking-[0.3em] uppercase ${isPaperTheme ? 'text-letterpress-strong paper-border-sm' : 'border border-amber-800 bg-amber-900/10'}`}
                    >
                        {t('cv.interactive_portfolio')}
                    </div>

                    <h1 className={`text-8xl sm:text-[160px] font-black font-heading tracking-tighter leading-none mb-4 ${isPaperTheme ? 'text-letterpress-title' : 'text-primary'}`}>
                        {t('brand.author_name')}
                    </h1>

                    <p className={`text-2xl sm:text-4xl font-medium tracking-tight ${isPaperTheme ? 'text-letterpress-subtle' : 'text-secondary'}`}>
                        {t('cv.role')}
                    </p>

                    <div className="pt-12 flex justify-center gap-6">
                        <div className="w-px h-24 bg-linear-to-b from-amber-700 to-transparent"></div>
                    </div>
                </div>
            </header>

            {/* 2. Experience Section (Interactive Slider) */}
            <section ref={horizontalSectionRef} className="py-32 bg-transparent relative overflow-hidden flex flex-col z-10">
                <div className="px-6 sm:px-20 z-20 mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                    <div className="space-y-4">
                        <h2 className={`text-sm font-mono tracking-[0.4em] uppercase font-bold ${isPaperTheme ? 'text-letterpress' : ''}`}>{t('cv.work_history')}</h2>
                        <h3 className={`text-5xl sm:text-7xl font-black tracking-tighter ${isPaperTheme ? 'text-letterpress-strong' : ''}`}>{t('cv.experience_gallery')}</h3>
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
                            className={`p-6 rounded-full transition-all hover:scale-110 active:scale-95 ${currentExpIndex === 0 ? 'opacity-20 cursor-not-allowed' : ''} ${isPaperTheme ? 'paper-border' : 'border backdrop-blur-3xl shadow-2xl btn-secondary'}`}
                        >
                            <svg className={`w-8 h-8 ${isPaperTheme ? 'paper-stroke' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    </div>
                    <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 z-30 hidden md:block">
                        <button
                            onClick={nextExp}
                            disabled={currentExpIndex >= maxIndex}
                            className={`p-6 rounded-full transition-all hover:scale-110 active:scale-95 ${currentExpIndex >= maxIndex ? 'opacity-20 cursor-not-allowed' : ''} ${isPaperTheme ? 'paper-border' : 'border backdrop-blur-3xl shadow-2xl btn-secondary'}`}
                        >
                            <svg className={`w-8 h-8 ${isPaperTheme ? 'paper-stroke' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-12 px-6 sm:px-20 items-stretch w-fit"
                    >
                        {experiences.map((exp, index) => (
                            <div key={index} className="exp-card-wrapper shrink-0 w-[85vw] sm:w-[500px] transition-all duration-700 flex">
                                <ExperienceCard exp={exp} isPaperTheme={isPaperTheme} />
                            </div>
                        ))}
                    </div>

                    {/* Mobile Navigation Buttons */}
                    <div className="flex justify-center gap-6 mt-12 md:hidden">
                        <button
                            onClick={prevExp}
                            disabled={currentExpIndex === 0}
                            className={`p-4 rounded-full transition-all ${currentExpIndex === 0 ? 'opacity-20 cursor-not-allowed' : ''} ${isPaperTheme ? 'paper-border' : 'border backdrop-blur-xl shadow-lg btn-secondary'}`}
                        >
                            <svg className={`w-6 h-6 ${isPaperTheme ? 'paper-stroke' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={nextExp}
                            disabled={currentExpIndex >= maxIndex}
                            className={`p-4 rounded-full transition-all ${currentExpIndex >= maxIndex ? 'opacity-20 cursor-not-allowed' : ''} ${isPaperTheme ? 'paper-border' : 'border backdrop-blur-xl shadow-lg btn-secondary'}`}
                        >
                            <svg className={`w-6 h-6 ${isPaperTheme ? 'paper-stroke' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* 3. Bento Layer (LiquidGlass Specifications) */}
            <section className="py-40 px-6 max-w-7xl mx-auto space-y-32 relative z-10">
                <div className="space-y-8">
                    <h2 className={`text-sm font-mono tracking-[0.4em] uppercase font-bold ${isPaperTheme ? 'text-letterpress' : ''}`}>{t('cv.core_components')}</h2>
                    <h3 className={`text-6xl sm:text-[100px] font-black tracking-tighter leading-none mb-4 ${isPaperTheme ? 'text-letterpress-strong' : ''}`}>{t('cv.specifications')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[minmax(300px,auto)]">
                    {isPaperTheme ? (
                        /* Paper Theme: Transparent cards with leather-style borders */
                        <>
                            <div className="md:col-span-12 p-12 flex flex-col rounded-[50px] paper-card">
                                <h3 className="text-sm font-mono tracking-[0.2em] uppercase mb-12 font-bold text-letterpress">{t('cv.full_stack_architecture')}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
                                    {Object.entries(skills).map(([category, items]) => (
                                        <div key={category} className="space-y-6">
                                            <h4 className="text-xs font-mono uppercase tracking-widest text-letterpress">{category}</h4>
                                            <div className="space-y-3">
                                                {items.map((s, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <span className="text-xl text-letterpress">{s.icon}</span>
                                                        <p className="text-lg font-light text-letterpress">{s.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {education.map((edu, index) => (
                                <div key={index} className="md:col-span-4 p-12 flex flex-col gap-4 relative overflow-hidden rounded-[50px] paper-card">
                                    <h4 className="text-sm font-mono tracking-[0.2em] uppercase font-bold text-letterpress">{edu.level}</h4>
                                    <div className="relative z-10">
                                        <h5 className="text-2xl font-black leading-tight mb-2 uppercase text-letterpress-strong">{edu.school}</h5>
                                        <p className="text-base uppercase tracking-wider text-letterpress">{edu.degree}</p>
                                    </div>
                                    <div className="absolute -right-6 -bottom-12 w-64 h-64 -rotate-12 pointer-events-none z-0 opacity-20 paper-icon-filter">
                                        {edu.icon}
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        /* Modern Theme: AuroraCards */
                        <>
                            <AuroraCard variant="multi" className="md:col-span-12 p-12 rounded-[50px] flex flex-col">
                                <h3 className="text-sm font-mono tracking-[0.2em] text-accent-primary uppercase mb-12 font-bold">{t('cv.full_stack_architecture')}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
                                    {Object.entries(skills).map(([category, items]) => (
                                        <div key={category} className="space-y-6">
                                            <h4 className="text-xs font-mono uppercase tracking-widest text-muted">{category}</h4>
                                            <div className="space-y-3">
                                                {items.map((s, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <span className="text-xl text-accent-primary">{s.icon}</span>
                                                        <p className="text-lg font-light text-primary">{s.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AuroraCard>

                            {education.map((edu, index) => {
                                const variants = ["purple", "cyan", "green"] as const;
                                const textColors = ["text-accent-primary", "text-accent-info", "text-accent-success"];
                                const variant = variants[index % variants.length];
                                const textColor = textColors[index % textColors.length];

                                return (
                                    <AuroraCard key={index} variant={variant} className="md:col-span-4 p-12 rounded-[50px] flex flex-col gap-4">
                                        <h4 className={`text-sm font-mono tracking-[0.2em] uppercase font-bold ${textColor}`}>{edu.level}</h4>
                                        <div className="relative z-10">
                                            <h5 className="text-2xl font-black leading-tight mb-2 uppercase text-primary">{edu.school}</h5>
                                            <p className="text-secondary text-base uppercase tracking-wider">{edu.degree}</p>
                                        </div>
                                        <div className="absolute -right-2 -bottom-12 w-64 h-64 grayscale -rotate-12 pointer-events-none z-0 invert-[--value-invert] opacity-30">
                                            {edu.icon}
                                        </div>
                                    </AuroraCard>
                                );
                            })}
                        </>
                    )}
                </div>

                {isPaperTheme ? (
                    /* Paper Theme Contact: Transparent card with leather-style border */
                    <div className="p-12 rounded-[60px] paper-card">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4 text-letterpress-strong">{t('cv.initiate_connect')}</h3>
                                <p className="text-2xl font-light text-letterpress">{t('cv.connect_description')}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                                <a
                                    href="mailto:m.zhang.changrui@gmail.com"
                                    className="px-10 py-4 text-lg font-medium rounded-full text-center text-letterpress transition-all hover:opacity-80 paper-btn"
                                >
                                    {t('cv.direct_mail')}
                                </a>
                                <a
                                    href={SOCIAL_LINKS.LINKEDIN}
                                    className="px-10 py-4 text-lg font-medium rounded-full text-center text-letterpress transition-all hover:opacity-80 paper-border-subtle"
                                >
                                    {t('cv.linkedin')}
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Modern Theme Contact Card */
                    <AuroraCard variant="purple" className="p-12 rounded-[60px]">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4 text-primary">{t('cv.initiate_connect')}</h3>
                                <p className="text-2xl font-light text-secondary">{t('cv.connect_description')}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                                <a href="mailto:m.zhang.changrui@gmail.com" className="px-10 py-4 text-lg font-medium rounded-full bg-accent-primary text-text-inverse shadow-xl hover:bg-accent-secondary hover:scale-105 transition-all text-center">{t('cv.direct_mail')}</a>
                                <a href={SOCIAL_LINKS.LINKEDIN} className="px-10 py-4 text-lg font-medium rounded-full border border-subtle bg-surface-alt/5 backdrop-blur-sm hover:bg-inset hover:scale-105 transition-all text-center text-primary">{t('cv.linkedin')}</a>
                            </div>
                        </div>
                    </AuroraCard>
                )}
            </section>

            {/* Footer */}
            <footer className="py-20 text-center relative z-10">
                <div className="space-y-2">
                    <p className={`text-xs font-mono uppercase tracking-[0.3em] ${isPaperTheme ? 'text-letterpress' : ''}`}>
                        {t('cv.last_updated')}: {t('cv.update_date')}
                    </p>
                    <p className={`text-xs font-mono tracking-wider ${isPaperTheme ? 'text-letterpress' : ''}`}>
                        {t('cv.location')}
                    </p>
                    <p className={`text-xs mt-4 opacity-70 ${isPaperTheme ? 'text-letterpress' : ''}`}>
                        © {new Date().getFullYear()} {t('brand.author_name')}
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default CV;
