import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LiquidDecoration } from './ui/LiquidDecoration';

interface SplashScreenProps {
    isLoading: boolean;
    error?: string | null;
    onRetry?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
    isLoading,
    error,
    onRetry
}) => {
    const { t } = useTranslation();

    if (!isLoading && !error) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-page flex flex-col items-center justify-center p-6 overflow-hidden"
        >
            {/* Liquid Glass Background Decorations - Static version */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-white/5 backdrop-blur-3xl border border-white/5" />
                <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full bg-white/5 backdrop-blur-3xl border border-white/5" />
            </div>

            {/* Logo/Brand Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center max-w-2xl w-full"
            >
                {/* Brand icon - Glassmorphism style */}
                <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 mb-10 flex items-center justify-center shadow-2xl shadow-purple-500/10 transition-transform hover:scale-105 duration-500">
                    <span className="text-primary text-4xl font-black italic select-none">M</span>
                </div>

                {error ? (
                    <div className="text-center animate-fade-in w-full flex flex-col items-center justify-center">
                        {/* Status Code Backdrop - Prominent but subtle */}
                        <div className="relative mb-8 w-full flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="text-[12rem] md:text-[18rem] font-black text-primary/[0.02] absolute inset-0 flex items-center justify-center select-none pointer-events-none font-mono tracking-tighter"
                            >
                                {error.includes('HTTP') ? error.match(/\d+/)?.[0] : '!'}
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl font-black text-primary relative z-10 tracking-tight leading-none">
                                {t('errors.connection.title', 'Connection error')}
                            </h1>
                        </div>

                        <div className="relative z-10 max-w-md mx-auto px-4">
                            <p className="text-secondary mb-12 text-lg font-light leading-relaxed">
                                {t('errors.connection.message', "We're currently unable to reach the server. Please check your internet connection or try again in a moment.")}
                            </p>

                            {/* Prominent Error Badge - Liquid Glass style */}
                            <div className="mb-12">
                                <div className="inline-flex flex-col items-center px-10 py-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-[30px] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700 hover:border-accent-primary/20">
                                    <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.4em] mb-4 opacity-40">
                                        System Status
                                    </span>
                                    <span className="text-2xl font-mono font-medium text-primary/80 tracking-tight">
                                        {error}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={onRetry}
                                className="w-full sm:w-auto px-16 py-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 text-white font-black text-lg shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto group border border-white/10"
                            >
                                <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t('connection.retry', 'Retry Connection')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <h1 className="text-xl font-medium text-secondary/80 tracking-widest uppercase mb-6 drop-shadow-sm">
                            {t('common.loading', 'Syncing Data')}
                        </h1>

                        {/* Minimal loading indicator - Glassmorphism style */}
                        <div className="flex space-x-3 mt-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-4 h-4 bg-white/20 backdrop-blur-md rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]"
                                    animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scale: [0.8, 1.2, 0.8],
                                        backgroundColor: ['rgba(255,255,255,0.1)', 'rgba(99,102,241,0.5)', 'rgba(255,255,255,0.1)']
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};
