import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Trans } from 'react-i18next';
import { FaTrophy } from 'react-icons/fa';

interface GuestAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export function GuestAlertModal({ isOpen, onClose, onLogin }: GuestAlertModalProps) {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl max-w-xs md:max-w-sm w-full shadow-lg text-center relative overflow-hidden mx-2"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>

                        <h3 className="text-lg md:text-2xl font-black font-heading mb-3 md:mb-4 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 dark:from-cyan-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent drop-shadow-sm flex items-center justify-center gap-2">
                            <Trans i18nKey="game.you_win" />
                            <FaTrophy className="text-yellow-500" />
                        </h3>

                        <p className="text-gray-700 dark:text-gray-200 mb-4 md:mb-6 font-medium text-sm md:text-lg drop-shadow-sm">
                            {t('game.highscore_guest_alert')}
                        </p>

                        <div className="flex flex-col gap-2 md:gap-3">
                            <button
                                onClick={() => {
                                    onClose();
                                    onLogin();
                                }}
                                className="w-full py-2.5 md:py-3 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-400 hover:via-purple-500 hover:to-pink-500 text-white font-bold rounded-lg md:rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 backdrop-blur-xl border border-white/20 hover:scale-[1.02] active:scale-[0.98] text-sm md:text-base min-h-[44px]"
                            >
                                {t('auth.login')} / {t('auth.register')}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors text-xs md:text-sm font-bold hover:bg-gray-100/70 dark:hover:bg-gray-700/50 rounded-lg backdrop-blur-xl min-h-[44px]"
                            >
                                {t('admin.cancel')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
