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
        <div className="page-container flex flex-col items-center justify-center p-8 text-center relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
            >
                <div className="text-6xl mb-6">🚧</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
                    {t('maintenance.title')}
                </h1>
                <p className="text-xl text-secondary max-w-md mx-auto mb-8 font-mono whitespace-pre-wrap">
                    {message || t('maintenance.description')}
                </p>

                {activatedBy && (
                    <div className="mb-8 text-sm text-muted font-mono">
                        {t('maintenance.disabled_by')}: <span className="font-bold">{activatedBy}</span>
                    </div>
                )}

                <div className="h-1 w-24 mx-auto rounded-full bg-border-default/20 mb-12">
                    <motion.div
                        className="h-full rounded-full bg-blue-500"
                        animate={{ width: ['0%', '100%', '0%'], x: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
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
