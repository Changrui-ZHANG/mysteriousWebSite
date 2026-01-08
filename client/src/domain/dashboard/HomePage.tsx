/**
 * HomePage - Main dashboard hub with Bento Grid navigation
 * Serves as the central navigation point for all site features
 */

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserAstronaut, FaComments, FaLightbulb, FaGamepad, FaCalendarAlt, FaGithub, FaLinkedin } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { SOCIAL_LINKS } from '../../shared/constants/urls';
import {
    BentoCard,
    DashboardGrid,
    FloatingParticles,
    AnimatedBlobs,
    HomeFooter,
    CvMockup,
    MessagesMockup,
    SuggestionsMockup,
    GameMockup,
    CalendarMockup
} from './components';

// Constants
const TAGLINE_ROTATION_INTERVAL = 5000;

export function Home() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('common.good_morning');
        if (hour < 18) return t('common.good_afternoon');
        return t('common.good_evening');
    };

    // Rotating taglines from translations
    const taglines = t('soul.taglines', { returnObjects: true }) as string[];
    const [currentTagline, setCurrentTagline] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTagline((prev) => (prev + 1) % taglines.length);
        }, TAGLINE_ROTATION_INTERVAL);
        return () => clearInterval(interval);
    }, [taglines.length]);

    return (
        <div className="page-container min-h-screen pt-28 pb-0 flex flex-col relative overflow-hidden">
            {/* Film Grain Overlay */}
            <div className="film-grain opacity-[0.03] dark:opacity-[0.05]" />

            {/* Background Atmosphere */}
            <AnimatedBlobs />
            <FloatingParticles />

            <div className="flex-grow relative z-10">
                {/* WELCOME HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center md:text-left"
                >
                    <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter mb-4 leading-none">
                        <span className="opacity-70 font-medium block md:inline text-3xl md:text-5xl mb-2 md:mb-0">
                            {getGreeting()},
                        </span>
                        <span className="block md:ml-4 bg-gradient-to-r from-primary via-accent-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                            {user?.username || t('common.guest')}
                        </span>
                        <motion.span
                            animate={{ rotate: [0, 14, -8, 14, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                            className="ml-4 text-4xl md:text-6xl inline-block"
                        >
                            👋
                        </motion.span>
                    </h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-xl md:text-2xl text-secondary max-w-2xl leading-relaxed border-l-2 border-accent-primary/30 pl-6"
                    >
                        {t('dashboard.welcome_subtitle')}
                    </motion.p>

                    {/* Rotating Tagline */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentTagline}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="mt-6 text-sm md:text-base font-mono text-accent-primary/70 italic tracking-wide"
                        >
                            "{taglines[currentTagline]}"
                            <span className="animate-blink ml-1">|</span>
                        </motion.p>
                    </AnimatePresence>
                </motion.div>

                {/* BENTO GRID DASHBOARD */}
                <DashboardGrid>
                    {/* 1. CV CARD */}
                    <BentoCard
                        to="/cv"
                        title={t('nav.cv')}
                        description={t('dashboard.cv_desc')}
                        icon={<FaUserAstronaut className="w-6 h-6" />}
                        className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                    >
                        <CvMockup />
                    </BentoCard>

                    {/* 2. MESSAGE WALL */}
                    <BentoCard
                        to="/messages"
                        title={t('nav.messages')}
                        description={t('dashboard.messages_desc')}
                        icon={<FaComments className="w-6 h-6" />}
                        className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
                    >
                        <MessagesMockup />
                    </BentoCard>

                    {/* 3. SUGGESTIONS */}
                    <BentoCard
                        to="/suggestions"
                        title={t('nav.suggestions')}
                        description={t('dashboard.suggestions_desc')}
                        icon={<FaLightbulb className="w-6 h-6" />}
                        className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-yellow-500/10 to-amber-500/10"
                    >
                        <SuggestionsMockup />
                    </BentoCard>

                    {/* 4. GAME HUB */}
                    <BentoCard
                        to="/game"
                        title={t('nav.game')}
                        description={t('dashboard.game_desc')}
                        icon={<FaGamepad className="w-6 h-6" />}
                        className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-red-500/10 to-orange-500/10"
                    >
                        <GameMockup />
                    </BentoCard>

                    {/* 5. CALENDAR */}
                    <BentoCard
                        to="/calendar"
                        title={t('nav.calendar')}
                        description={t('dashboard.calendar_desc')}
                        icon={<FaCalendarAlt className="w-6 h-6" />}
                        className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
                    >
                        <CalendarMockup />
                    </BentoCard>

                    {/* 6. SOCIAL GITHUB */}
                    <a
                        href={SOCIAL_LINKS.GITHUB}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-xl hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl transition-all duration-700 md:col-span-1 md:row-span-1 flex items-center justify-center p-8"
                    >
                        <div className="text-center relative z-10 transition-transform duration-500 group-hover:scale-110">
                            <FaGithub className="w-12 h-12 mx-auto mb-2 opacity-80" />
                            <span className="font-bold">GitHub</span>
                        </div>
                    </a>

                    {/* 7. SOCIAL LINKEDIN */}
                    <a
                        href={SOCIAL_LINKS.LINKEDIN}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-xl hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl transition-all duration-700 md:col-span-1 md:row-span-1 flex items-center justify-center p-8"
                    >
                        <div className="text-center relative z-10 transition-transform duration-500 group-hover:scale-110">
                            <FaLinkedin className="w-12 h-12 mx-auto mb-2 opacity-80 text-[#0077b5]" />
                            <span className="font-bold">LinkedIn</span>
                        </div>
                    </a>
                </DashboardGrid>
            </div>

            <HomeFooter />
        </div>
    );
}
