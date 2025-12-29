import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Trans } from 'react-i18next';

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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white/10 border border-white/20 backdrop-blur-md p-6 md:p-8 rounded-2xl max-w-sm w-full shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>

                        <h3 className="text-2xl font-black font-heading mb-4 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                            <Trans i18nKey="game.you_win" /> 🏆
                        </h3>

                        <p className="text-white/90 mb-6 font-medium text-lg">
                            {t('game.highscore_guest_alert')}
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    onClose();
                                    onLogin();
                                }}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-pink-500/25"
                            >
                                {t('auth.login')} / {t('auth.register')}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-white/50 hover:text-white transition-colors text-sm font-bold"
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
