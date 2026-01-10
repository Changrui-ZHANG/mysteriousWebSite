import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface MaintenancePageProps {
    message?: string;
    activatedBy?: string;
    onAdminLogin?: (code: string) => Promise<boolean>;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ message, activatedBy, onAdminLogin }) => {
    const { t } = useTranslation();
    const [showAdminInput, setShowAdminInput] = React.useState(false);
    const [loginCode, setLoginCode] = React.useState('');
    const [isChecking, setIsChecking] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onAdminLogin) {
            setIsChecking(true);
            const success = await onAdminLogin(loginCode);
            setIsChecking(false);
            if (!success) {
                alert(t('admin.invalid_code'));
            } else {
                setLoginCode('');
            }
        }
    };

    return (
        <div className="page-container flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Simple animated background */}
            <div className="absolute inset-0 opacity-5">
                <motion.div
                    className="absolute w-32 h-32 bg-blue-500 rounded-full blur-xl"
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -50, 100, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ top: '20%', left: '10%' }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center relative z-10"
            >
                {/* Simple icon */}
                <motion.div
                    animate={{ 
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-6xl mb-8"
                >
                    🔧
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
                    {t('maintenance.title')}
                </h1>
                
                <p className="text-lg text-secondary max-w-md mx-auto mb-8 leading-relaxed">
                    {message || t('maintenance.description')}
                </p>

                {activatedBy && (
                    <div className="mb-8 text-sm text-muted font-mono px-4 py-2 bg-surface-secondary rounded-lg border border-border-default/30">
                        {t('maintenance.disabled_by')}: <span className="font-bold text-accent-primary">{activatedBy}</span>
                    </div>
                )}

                {/* Simple loading dots */}
                <div className="flex space-x-2 mb-12">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>

                {/* Admin Access Section */}
                {onAdminLogin && (
                    <div className="flex flex-col items-center gap-4">
                        {!showAdminInput ? (
                            <button
                                onClick={() => setShowAdminInput(true)}
                                className="btn-secondary text-sm opacity-30 hover:opacity-100 flex items-center gap-2"
                            >
                                🔐 {t('auth.admin_access')}
                            </button>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={loginCode}
                                        onChange={(e) => setLoginCode(e.target.value)}
                                        placeholder={t('admin.code_placeholder')}
                                        className="input text-center font-mono w-48"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={isChecking}
                                        className="btn-primary"
                                    >
                                        {isChecking ? '...' : t('common.go')}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAdminInput(false)}
                                    className="text-xs text-muted hover:text-secondary hover:underline"
                                >
                                    {t('common.cancel')}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
