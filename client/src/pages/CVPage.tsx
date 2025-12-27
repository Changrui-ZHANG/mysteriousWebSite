import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface CVProps {
    isDarkMode: boolean;
}

export function CV({ isDarkMode }: CVProps) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLElement>(null);
    const profileRef = useRef<HTMLElement>(null);
    const experienceRef = useRef<HTMLElement>(null);
    const skillsRef = useRef<HTMLElement>(null);
    const educationRef = useRef<HTMLElement>(null);
    const additionalRef = useRef<HTMLElement>(null);
    const timelineLineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const skills = {
        frontend: ["React", "JavaScript", "TypeScript", "Tailwind CSS", "Vite", "Three.js"],
        backend: ["Java", "Spring Boot", "Scala", "C/C++", "Python", "REST API"],
        database: ["PostgreSQL", "MariaDB", "MySQL", "SQL/NoSQL", "Elasticsearch", "Redis"],
        devops: ["Docker", "CI/CD", "Git", "Jenkins", "Linux", "Windows"],
        os: ["Linux", "Windows"]
    };

    const getArray = (key: string): string[] => {
        const items = t(key, { returnObjects: true });
        if (Array.isArray(items)) {
            return items as string[];
        }
        return [];
    };

    const experiences = [
        {
            title: t('cv.exp.espace.title'),
            role: t('cv.exp.espace.role'),
            period: "Current",
            location: "Paris, France",
            description: getArray('cv.exp.espace.desc'),
            tech: ["Java", "Spring Boot", "ReactJS", "Vite", "Tailwind", "Docker", "PostgreSQL"]
        },
        {
            title: t('cv.exp.rakuten.title'),
            role: t('cv.exp.rakuten.role'),
            period: "02/2024 - 09/2024",
            location: "Paris, France",
            description: getArray('cv.exp.rakuten.desc'),
            tech: ["Java", "Spring Boot", "ReactJS", "JavaScript", "TypeScript", "SQL", "Docker", "Git", "Jenkins", "Elasticsearch", "Hibernate", "Redis", "MariaDB", "Liquibase", "Jira", "Velocity", "Prometheus", "Grafana", "CI/CD", "IntelliJ", "API REST"]
        },
        {
            title: t('cv.exp.sorbonne.title'),
            role: t('cv.exp.sorbonne.role'),
            period: "09/2023 - 03/2024",
            location: "Paris, France",
            description: getArray('cv.exp.sorbonne.desc'),
            tech: ["Java", "Spring Boot", "ReactJS", "MySQL", "Feature Flags", "Microservices"]
        },
        {
            title: t('cv.exp.quichefs.title'),
            role: t('cv.exp.quichefs.role'),
            period: "09/2023 - 03/2024",
            location: "Paris, France",
            description: getArray('cv.exp.quichefs.desc'),
            tech: ["C", "Linux Kernel", "File Systems", "ioctl"]
        },
        {
            title: t('cv.exp.database.title'),
            role: t('cv.exp.database.role'),
            period: "09/2021 - 03/2022",
            location: "Paris, France",
            description: getArray('cv.exp.database.desc'),
            tech: ["PostgreSQL", "BOUML", "StarUML"]
        }
    ];

    const education = [
        {
            degree: t('cv.edu.master'),
            school: "Sorbonne Université",
            period: "2022 - 2024"
        },
        {
            degree: t('cv.edu.licence'),
            school: "Université Paris Cité",
            period: "2019 - 2022"
        }
    ];

    // Centralized Animation Configuration
    const ANIM_CONFIG = {
        // Hero section
        hero: {
            name: { duration: 0.4, stagger: 0.015 },
            role: { duration: 0.5, delay: 0.3 },
            contact: { duration: 0.3, stagger: 0.05, delay: 0.5 }
        },
        // Main sections
        profile: { duration: 0.6, scrollTriggerStart: "top 80%" },
        timeline: { duration: 0.8, scrub: 0.5, scrollTriggerStart: "top 70%" },
        experience: {
            card: { duration: 0.5, scrollTriggerStart: "top 85%" },
            tech: { duration: 0.2, stagger: 0.01, scrollTriggerStart: "top 70%" },
            dot: { duration: 0.25, scrollTriggerStart: "top 80%" }
        },
        skills: {
            card: { duration: 0.4, staggerDelay: 0.08, scrollTriggerStart: "top 75%" },
            tag: { duration: 0.25, stagger: 0.02, scrollTriggerStart: "top 70%" }
        },
        education: {
            card: { duration: 0.4, staggerDelay: 0.1, scrollTriggerStart: "top 80%" }
        },
        additional: {
            card: { duration: 0.5, staggerDelay: 0.08, scrollTriggerStart: "top 80%" },
            item: { duration: 0.25, stagger: 0.04, scrollTriggerStart: "top 70%" }
        },
        // Common elements
        sectionTitle: { duration: 0.5, scrollTriggerStart: "top 85%" }
    };

    // GSAP Animations
    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1px)", () => {
            // Hero Section Animation
            const heroTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });

            // Animate name letters
            const nameElement = heroRef.current?.querySelector('.hero-name');
            if (nameElement) {
                const text = nameElement.textContent || '';
                // Each letter gets its own gradient styling to maintain the text-gradient effect
                nameElement.innerHTML = text.split('').map((char) =>
                    `<span class="hero-letter" style="display: inline-block; background: linear-gradient(to right, #22d3ee, #a855f7, #ec4899); -webkit-background-clip: text; background-clip: text; color: transparent; opacity: 0; transform: translateY(100px) rotateX(-90deg);">${char === ' ' ? '&nbsp;' : char}</span>`
                ).join('');

                heroTimeline.to('.hero-letter', {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: ANIM_CONFIG.hero.name.duration,
                    stagger: ANIM_CONFIG.hero.name.stagger,
                    ease: "back.out(1.7)"
                }, 0);
            }

            // Animate role text
            heroTimeline.fromTo('.hero-role',
                { opacity: 0, y: 30, filter: 'blur(10px)' },
                {
                    opacity: 0.7,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: ANIM_CONFIG.hero.role.duration
                },
                ANIM_CONFIG.hero.role.delay
            );

            // Animate contact info
            heroTimeline.fromTo('.hero-contact span, .hero-contact a',
                { opacity: 0, y: 20 },
                {
                    opacity: 0.6,
                    y: 0,
                    duration: ANIM_CONFIG.hero.contact.duration,
                    stagger: ANIM_CONFIG.hero.contact.stagger
                },
                ANIM_CONFIG.hero.contact.delay
            );

            // Profile Section - 3D Rotation Entrance
            gsap.fromTo(profileRef.current?.querySelector('.profile-card'),
                {
                    opacity: 0,
                    scale: 0.8,
                    rotateY: -15,
                    transformPerspective: 1000
                },
                {
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                    duration: ANIM_CONFIG.profile.duration,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: profileRef.current,
                        start: ANIM_CONFIG.profile.scrollTriggerStart,
                        toggleActions: "play none none reverse"
                    }
                }
            );

            // Animated glow pulse
            gsap.to('.profile-glow', {
                scale: 1.1,
                opacity: 0.7,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Timeline Line Drawing Animation
            if (timelineLineRef.current) {
                gsap.fromTo(timelineLineRef.current,
                    { scaleY: 0, transformOrigin: "top center" },
                    {
                        scaleY: 1,
                        duration: ANIM_CONFIG.timeline.duration,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: experienceRef.current,
                            start: ANIM_CONFIG.timeline.scrollTriggerStart,
                            end: "bottom 30%",
                            scrub: ANIM_CONFIG.timeline.scrub
                        }
                    }
                );
            }

            // Experience Cards - Alternating Slide Animation
            const expCards = experienceRef.current?.querySelectorAll('.exp-card');
            expCards?.forEach((card, index) => {
                const direction = index % 2 === 0 ? 100 : -100;

                gsap.fromTo(card,
                    {
                        opacity: 0,
                        x: direction,
                        rotateY: direction > 0 ? 10 : -10,
                        transformPerspective: 1000
                    },
                    {
                        opacity: 1,
                        x: 0,
                        rotateY: 0,
                        duration: ANIM_CONFIG.experience.card.duration,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: card,
                            start: ANIM_CONFIG.experience.card.scrollTriggerStart,
                            toggleActions: "play none none reverse"
                        }
                    }
                );

                // Tech tags stagger within each card
                const techTags = card.querySelectorAll('.tech-tag');
                gsap.fromTo(techTags,
                    { opacity: 0, scale: 0, y: 10 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: ANIM_CONFIG.experience.tech.duration,
                        stagger: ANIM_CONFIG.experience.tech.stagger,
                        ease: "back.out(2)",
                        scrollTrigger: {
                            trigger: card,
                            start: ANIM_CONFIG.experience.tech.scrollTriggerStart,
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // Timeline dots pop animation
            const timelineDots = experienceRef.current?.querySelectorAll('.timeline-dot');
            timelineDots?.forEach((dot) => {
                gsap.fromTo(dot,
                    { scale: 0, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        duration: ANIM_CONFIG.experience.dot.duration,
                        ease: "elastic.out(1, 0.5)",
                        scrollTrigger: {
                            trigger: dot,
                            start: ANIM_CONFIG.experience.dot.scrollTriggerStart,
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // Skills Section - Flip Cards Animation
            const skillCards = skillsRef.current?.querySelectorAll('.skill-card');
            skillCards?.forEach((card, index) => {
                gsap.fromTo(card,
                    {
                        opacity: 0,
                        rotateX: -90,
                        y: 50,
                        transformPerspective: 1000,
                        transformOrigin: "top center"
                    },
                    {
                        opacity: 1,
                        rotateX: 0,
                        y: 0,
                        duration: ANIM_CONFIG.skills.card.duration,
                        delay: index * ANIM_CONFIG.skills.card.staggerDelay,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: skillsRef.current,
                            start: ANIM_CONFIG.skills.card.scrollTriggerStart,
                            toggleActions: "play none none reverse"
                        }
                    }
                );

                // Skill tags wave animation
                const skillTags = card.querySelectorAll('.skill-tag');
                gsap.fromTo(skillTags,
                    { opacity: 0, y: 20, scale: 0.8 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: ANIM_CONFIG.skills.tag.duration,
                        stagger: {
                            each: ANIM_CONFIG.skills.tag.stagger,
                            from: "start"
                        },
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: card,
                            start: ANIM_CONFIG.skills.tag.scrollTriggerStart,
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // Education Cards - Bounce Entrance
            const eduCards = educationRef.current?.querySelectorAll('.edu-card');
            eduCards?.forEach((card, index) => {
                gsap.fromTo(card,
                    { opacity: 0, y: 80, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: ANIM_CONFIG.education.card.duration,
                        delay: index * ANIM_CONFIG.education.card.staggerDelay,
                        ease: "bounce.out",
                        scrollTrigger: {
                            trigger: educationRef.current,
                            start: ANIM_CONFIG.education.card.scrollTriggerStart,
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // Additional Info Cards - Multi-directional Entrance
            const additionalCards = additionalRef.current?.querySelectorAll('.info-card');
            const directions = [
                { x: -100, rotate: -5 },
                { y: 100, rotate: 0 },
                { x: 100, rotate: 5 }
            ];

            additionalCards?.forEach((card, index) => {
                const dir = directions[index % 3];
                gsap.fromTo(card,
                    {
                        opacity: 0,
                        x: dir.x || 0,
                        y: dir.y || 0,
                        rotate: dir.rotate,
                        scale: 0.8
                    },
                    {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        rotate: 0,
                        scale: 1,
                        duration: ANIM_CONFIG.additional.card.duration,
                        delay: index * ANIM_CONFIG.additional.card.staggerDelay,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: additionalRef.current,
                            start: ANIM_CONFIG.additional.card.scrollTriggerStart,
                            toggleActions: "play none none reverse"
                        }
                    }
                );

                // Items inside cards
                const items = card.querySelectorAll('.info-item');
                gsap.fromTo(items,
                    { opacity: 0, x: -20, filter: 'blur(5px)' },
                    {
                        opacity: 1,
                        x: 0,
                        filter: 'blur(0px)',
                        duration: ANIM_CONFIG.additional.item.duration,
                        stagger: ANIM_CONFIG.additional.item.stagger,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: card,
                            start: ANIM_CONFIG.additional.item.scrollTriggerStart,
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // Section titles animation
            const sectionTitles = containerRef.current?.querySelectorAll('.section-title');
            sectionTitles?.forEach((title) => {
                gsap.fromTo(title,
                    {
                        opacity: 0,
                        y: 50,
                        scale: 0.9,
                        filter: 'blur(10px)'
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        duration: ANIM_CONFIG.sectionTitle.duration,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: title,
                            start: ANIM_CONFIG.sectionTitle.scrollTriggerStart,
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });
        });

        return () => mm.revert();
    }, { scope: containerRef });

    // Hover animation for cards
    const handleCardHover = (e: React.MouseEvent<HTMLDivElement>, isEnter: boolean) => {
        const card = e.currentTarget;
        if (isEnter) {
            gsap.to(card, {
                scale: 1.02,
                boxShadow: isDarkMode
                    ? '0 20px 40px rgba(0, 255, 255, 0.15), 0 0 30px rgba(168, 85, 247, 0.1)'
                    : '0 20px 40px rgba(0, 0, 0, 0.15)',
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            gsap.to(card, {
                scale: 1,
                boxShadow: 'none',
                duration: 0.3,
                ease: "power2.out"
            });
        }
    };

    // 3D tilt effect on mouse move
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
            duration: 0.3,
            ease: "power2.out"
        });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(e.currentTarget, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            boxShadow: 'none',
            duration: 0.5,
            ease: "power2.out"
        });
    };

    return (
        <div
            ref={containerRef}
            className={`min-h-screen pt-32 pb-24 px-4 sm:px-8 transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-dark text-white' : 'bg-gray-50 text-gray-900'}`}
        >

            {/* Hero Section */}
            <header ref={heroRef} className="max-w-4xl mx-auto text-center mb-24">
                <h1 className="hero-name text-6xl sm:text-8xl font-heading font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight pb-2">
                    Changrui ZHANG
                </h1>
                <p className="hero-role text-2xl font-serif italic opacity-0 mb-8">
                    {t('cv.role')}
                </p>
                <div className="hero-contact flex flex-wrap justify-center gap-6 text-sm opacity-0 font-mono">
                    <span className="hover:text-cyan-400 transition-colors cursor-default">m.zhang.changrui@gmail.com</span>
                    <span className="hover:text-purple-400 transition-colors cursor-default">+33 6 52 94 63 09</span>
                    <span className="hover:text-pink-400 transition-colors cursor-default">Paris, France</span>
                    <a href="https://linkedin.com/in/changrui-zhang" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors hover:scale-110 inline-block">LinkedIn</a>
                    <a href="https://github.com/Changrui-ZHANG" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors hover:scale-110 inline-block">GitHub</a>
                </div>
            </header>

            {/* Profile */}
            <section ref={profileRef} className="max-w-3xl mx-auto mb-24 relative">
                <div className="profile-glow absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl rounded-full opacity-50"></div>
                <div
                    className={`profile-card relative p-8 rounded-2xl border backdrop-blur-md ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5 shadow-lg'}`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <h2 className="section-title text-3xl font-heading font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{t('cv.sections.profile')}</h2>
                    <p className="text-lg leading-relaxed opacity-80">
                        {t('cv.profile_text')}
                    </p>
                </div>
            </section>

            {/* Experience Timeline */}
            <section ref={experienceRef} className="max-w-5xl mx-auto mb-24">
                <h2 className="section-title text-5xl font-heading font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{t('cv.sections.experience')}</h2>
                <div className="relative">
                    {/* Animated Vertical Line */}
                    <div
                        ref={timelineLineRef}
                        className={`absolute left-0 sm:left-1/2 top-0 bottom-0 w-0.5 ${isDarkMode ? 'bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500' : 'bg-gradient-to-b from-purple-400 via-pink-400 to-cyan-400'}`}
                    ></div>

                    {experiences.map((exp, index) => (
                        <div key={index} className={`relative flex flex-col sm:flex-row items-center mb-16 ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
                            {/* Animated Dot */}
                            <div className={`timeline-dot absolute left-[-5px] sm:left-1/2 w-4 h-4 rounded-full -translate-x-1.5 z-10 ${isDarkMode ? 'bg-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.8)]' : 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]'}`}></div>

                            {/* Content */}
                            <div className="w-full sm:w-1/2 pl-8 sm:px-12">
                                <div
                                    className={`exp-card p-6 rounded-xl border cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-md hover:shadow-xl'} transition-all`}
                                    onMouseEnter={(e) => handleCardHover(e, true)}
                                    onMouseLeave={(e) => { handleCardHover(e, false); handleMouseLeave(e); }}
                                    onMouseMove={handleMouseMove}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent">{exp.title}</h3>
                                        <span className="text-xs font-mono opacity-50 whitespace-nowrap px-2 py-1 rounded-full border border-current">{exp.period}</span>
                                    </div>
                                    <p className="text-lg font-serif italic mb-4 opacity-90">{exp.role}</p>
                                    <ul className="space-y-2 mb-6 opacity-70 text-sm list-disc pl-4">
                                        {exp.description.map((desc, i) => (
                                            <li key={i}>{desc}</li>
                                        ))}
                                    </ul>
                                    <div className="flex flex-wrap gap-2">
                                        {exp.tech.map((tech, i) => (
                                            <span key={i} className={`tech-tag px-2 py-1 text-xs rounded-md transition-all hover:scale-110 ${isDarkMode ? 'bg-white/10 text-cyan-200 hover:bg-cyan-500/30' : 'bg-gray-100 text-purple-700 hover:bg-purple-100'}`}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section ref={skillsRef} className="max-w-6xl mx-auto mb-24">
                <h2 className="section-title text-5xl font-heading font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{t('cv.sections.skills')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Object.entries(skills).map(([category, items], idx) => (
                        <div
                            key={category}
                            className={`skill-card p-6 rounded-2xl border cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-cyan-500/50' : 'bg-white shadow-xl border-gray-100 hover:border-purple-300'} transition-all`}
                            onMouseEnter={(e) => handleCardHover(e, true)}
                            onMouseLeave={(e) => { handleCardHover(e, false); handleMouseLeave(e); }}
                            onMouseMove={handleMouseMove}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <h3 className="text-xl font-bold mb-6 capitalize text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{category}</h3>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {items.map((skill, i) => (
                                    <span key={i} className={`skill-tag px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-110 cursor-default ${isDarkMode ? 'bg-gradient-to-r from-white/10 to-white/5 hover:from-cyan-500/30 hover:to-purple-500/30' : 'bg-gray-100 hover:bg-gradient-to-r hover:from-cyan-100 hover:to-purple-100'}`}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section ref={educationRef} className="max-w-4xl mx-auto mb-24">
                <h2 className="section-title text-4xl font-heading font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{t('cv.sections.education')}</h2>
                <div className="grid gap-6">
                    {education.map((edu, index) => (
                        <div
                            key={index}
                            className={`edu-card flex flex-col sm:flex-row justify-between items-center p-8 rounded-xl border cursor-pointer ${isDarkMode ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-white hover:shadow-xl'} transition-all`}
                            onMouseEnter={(e) => handleCardHover(e, true)}
                            onMouseLeave={(e) => { handleCardHover(e, false); handleMouseLeave(e); }}
                            onMouseMove={handleMouseMove}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{edu.degree}</h3>
                                <p className="opacity-60 mt-1">{edu.school}</p>
                            </div>
                            <span className={`mt-4 sm:mt-0 px-4 py-2 rounded-full border font-mono text-sm ${isDarkMode ? 'border-cyan-500/50 text-cyan-300' : 'border-purple-300 text-purple-600'}`}>
                                {edu.period}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Additional Info Grid */}
            <section ref={additionalRef} className="max-w-6xl mx-auto mb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Soft Skills */}
                    <div
                        className={`info-card p-8 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-lg border-gray-100'}`}
                        onMouseEnter={(e) => handleCardHover(e, true)}
                        onMouseLeave={(e) => { handleCardHover(e, false); handleMouseLeave(e); }}
                        onMouseMove={handleMouseMove}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <h3 className="text-2xl font-heading font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{t('cv.sections.soft_skills')}</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {getArray('cv.soft_skills_list').map((item, i) => (
                                <span key={i} className={`info-item px-3 py-1 rounded-full text-sm transition-all hover:scale-110 cursor-default ${isDarkMode ? 'bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/40' : 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'}`}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    <div
                        className={`info-card p-8 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-lg border-gray-100'}`}
                        onMouseEnter={(e) => handleCardHover(e, true)}
                        onMouseLeave={(e) => { handleCardHover(e, false); handleMouseLeave(e); }}
                        onMouseMove={handleMouseMove}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <h3 className="text-2xl font-heading font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{t('cv.sections.languages')}</h3>
                        <ul className="space-y-4">
                            <li className="info-item flex justify-between items-center border-b pb-2 border-inherit opacity-80 hover:opacity-100 transition-opacity">
                                <span>{t('cv.languages_list.zh')}</span>
                            </li>
                            <li className="info-item flex justify-between items-center border-b pb-2 border-inherit opacity-80 hover:opacity-100 transition-opacity">
                                <span>{t('cv.languages_list.en')}</span>
                            </li>
                            <li className="info-item flex justify-between items-center border-b pb-2 border-inherit opacity-80 hover:opacity-100 transition-opacity">
                                <span>{t('cv.languages_list.fr')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Interests */}
                    <div
                        className={`info-card p-8 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-lg border-gray-100'}`}
                        onMouseEnter={(e) => handleCardHover(e, true)}
                        onMouseLeave={(e) => { handleCardHover(e, false); handleMouseLeave(e); }}
                        onMouseMove={handleMouseMove}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <h3 className="text-2xl font-heading font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{t('cv.sections.interests')}</h3>
                        <div className="flex flex-col items-center gap-4">
                            {getArray('cv.interests_list').map((item, i) => (
                                <div key={i} className="info-item flex items-center gap-3 hover:scale-105 transition-transform cursor-default">
                                    <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-purple-600'}`}></div>
                                    <span className="text-lg opacity-80">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
}

export default CV;
