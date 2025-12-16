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
    // Fallback to holiday name if translation is missing (though we added them all)
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
                        className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm cursor-pointer transition-colors duration-300"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`
                            relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl 
                            bg-white dark:bg-gray-900
                            border border-gray-100 dark:border-gray-800
                            transition-all duration-300
                        `}
                    >
                        {/* Thematic Header Gradient */}
                        <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${theme.gradient} opacity-20 dark:opacity-30`} />

                        {/* Decorative glow in background */}
                        <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r ${theme.gradient} rounded-full blur-[80px] opacity-20 dark:opacity-20`} />

                        {/* Content Container */}
                        <div className="relative p-8 flex flex-col items-center text-center z-10">

                            {/* Icon Badge */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className={`
                                    w-24 h-24 rounded-2xl rotate-3 flex items-center justify-center mb-6 
                                    shadow-lg bg-white dark:bg-gray-800
                                    border border-gray-100 dark:border-gray-700
                                    ring-1 ring-black/5 dark:ring-white/5
                                `}
                            >
                                <ThemeIcon className={`text-5xl ${theme.color} drop-shadow-sm`} />
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className={`text-3xl font-bold font-heading mb-3 text-gray-900 dark:text-white`}
                            >
                                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme.gradient} dark:text-white dark:bg-none filter brightness-110`}>
                                    {title}
                                </span>
                            </motion.h2>

                            {/* Date */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-block px-4 py-1.5 mb-8 rounded-full text-sm font-mono font-medium tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                            >
                                {dateFormatted}
                            </motion.div>

                            {/* Description */}
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg leading-relaxed text-gray-600 dark:text-gray-100 font-medium max-w-md mx-auto"
                            >
                                {description}
                            </motion.p>

                            {/* Close Button */}
                            <motion.button
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    mt-10 px-10 py-3 rounded-xl font-bold transition-all relative overflow-hidden group
                                    bg-gradient-to-r ${theme.gradient} text-white shadow-md hover:shadow-lg
                                `}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {t('common.close') || 'Fermer'}
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
