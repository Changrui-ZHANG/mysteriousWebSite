import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getHolidayTheme } from './holidayData';

interface HolidayModalProps {
    isOpen: boolean;
    onClose: () => void;
    holiday: {
        date: string;
        nom_jour_ferie: string;
    } | null;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({ isOpen, onClose, holiday }) => {
    const { t } = useTranslation();

    if (!holiday) return null;

    const theme = getHolidayTheme(holiday.nom_jour_ferie);
    const ThemeIcon = theme.icon;

    const dateObj = new Date(holiday.date);
    const dateFormatted = dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const descriptionKey = `holidays.${theme.key}.description`;
    const titleKey = `holidays.${theme.key}.title`;
    const description = t(descriptionKey);
    const title = t(titleKey, holiday.nom_jour_ferie);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer transition-colors duration-300"
                    />

                    {/* Modal Content - Liquid Glass Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className={`
                            relative w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]
                            bg-white/[0.03] border border-white/10 backdrop-blur-3xl 
                            after:absolute after:inset-0 after:rounded-[2.5rem] after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2)] after:pointer-events-none
                            transition-all duration-500
                        `}
                    >
                        {/* Animated Background Blobs */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className={`absolute -top-24 -left-20 w-64 h-64 bg-gradient-to-br ${theme.gradient} opacity-20 blur-[80px] animate-blob`} />
                            <div className={`absolute -bottom-24 -right-20 w-64 h-64 bg-gradient-to-br ${theme.gradient} opacity-10 blur-[80px] animate-blob animation-delay-2000`} />
                        </div>

                        {/* Content Scrollable (if needed) */}
                        <div className="relative p-10 flex flex-col items-center text-center z-10">

                            {/* Decorative Sheen Beam */}
                            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                            {/* Icon Badge - Liquid Style */}
                            <motion.div
                                initial={{ y: 20, opacity: 0, rotate: -10 }}
                                animate={{ y: 0, opacity: 1, rotate: 3 }}
                                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                                className={`
                                    w-28 h-28 rounded-3xl flex items-center justify-center mb-8
                                    bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl
                                    relative group-hover:scale-105 transition-transform duration-500
                                `}
                            >
                                {/* Inner Glow */}
                                <div className={`absolute inset-2 rounded-2xl bg-gradient-to-br ${theme.gradient} opacity-20 blur-xl`} />
                                <ThemeIcon className={`text-6xl ${theme.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10`} />
                            </motion.div>

                            {/* Title with Custom Gradient */}
                            <motion.h2
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl font-black font-heading mb-4 tracking-tight leading-tight"
                            >
                                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme.gradient} filter brightness-125 contrast-125 drop-shadow-sm`}>
                                    {title}
                                </span>
                            </motion.h2>

                            {/* Date Capsule */}
                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center px-5 py-2 mb-10 rounded-full text-sm font-mono font-bold tracking-[0.1em] uppercase bg-white/5 text-white/70 border border-white/10 shadow-lg"
                            >
                                <span className="w-2 h-2 rounded-full bg-accent-primary mr-3 animate-pulse shadow-[0_0_8px_var(--color-accent-primary)]" />
                                {dateFormatted}
                            </motion.div>

                            {/* Description - Living Glass Typography */}
                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-4 bg-white/[0.02] rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <p className="text-xl leading-relaxed text-white/80 font-medium max-w-sm mx-auto relative z-10">
                                    {description}
                                </p>
                            </motion.div>

                            {/* Close Button - Liquid Action */}
                            <motion.button
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                onClick={onClose}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    mt-12 px-12 py-4 rounded-2xl font-black text-lg transition-all relative overflow-hidden group
                                    border border-white/20 hover:border-white/40 shadow-xl
                                    bg-white/5 backdrop-blur-xl
                                `}
                            >
                                {/* Button Hover Fill */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                                <span className="relative z-10 flex items-center justify-center gap-3 text-white">
                                    {t('common.close')}
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </span>
                            </motion.button>
                        </div>

                        {/* Bottom Decoration Bar */}
                        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient} opacity-50`} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
