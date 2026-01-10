import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SplashScreenProps {
    isLoading: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
    isLoading
}) => {
    const { t } = useTranslation();
    
    if (!isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-surface-primary flex flex-col items-center justify-center"
        >
            {/* Logo/Brand - Appears immediately */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center"
            >


                {/* Brand name - Clean typography */}
                <h1 className="text-2xl font-bold text-primary mb-2">
                    {t('common.loading')}
                </h1>

                {/* Minimal loading indicator - No complex animations */}
                <div className="flex space-x-1 mt-4">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};