import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import { postJson } from '../../api/httpClient';
import { API_ENDPOINTS } from '../../constants/endpoints';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: { userId: string; username: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
    const { t } = useTranslation();
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const endpoint = authMode === 'login' ? API_ENDPOINTS.AUTH.LOGIN : API_ENDPOINTS.AUTH.REGISTER;

            // Use postJson for auto-unwrapping
            const data = await postJson<{ userId: string; username: string; message: string }>(endpoint, { username, password });

            if (authMode === 'login') {
                onLoginSuccess({ userId: data.userId, username: data.username });
                onClose();
                setUsername('');
                setPassword('');
            } else {
                setAuthMode('login');
                setSuccess(t('auth.success_register'));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('auth.failed');
            setError(errorMessage);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="auth-modal relative w-full max-w-md p-8 shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Shimmer/Reflection Effect */}
                        <div className="auth-modal-shimmer absolute inset-0 rounded-2xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {authMode === 'login' ? t('auth.login') : t('auth.register')}
                                </h2>
                                <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity p-1" aria-label={t('common.close')}>
                                    <FaTimes className="text-lg" />
                                </button>
                            </div>

                            <form onSubmit={handleAuth} className="flex flex-col gap-5">
                                {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">{error}</div>}
                                {success && <div className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center">{success}</div>}

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder={t('auth.username')}
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="auth-input w-full"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder={t('auth.password')}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="auth-input w-full"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="auth-button w-full"
                                >
                                    {authMode === 'login' ? t('auth.login') : t('auth.create_account')}
                                </button>
                            </form>

                            <div className="mt-8 text-center text-sm opacity-60">
                                {authMode === 'login' ? (
                                    <p>{t('auth.no_account')} <button onClick={() => setAuthMode('register')} className="font-bold hover:underline ml-1 opacity-100 hover:opacity-80 transition-opacity">{t('auth.register')}</button></p>
                                ) : (
                                    <p>{t('auth.has_account')} <button onClick={() => setAuthMode('login')} className="font-bold hover:underline ml-1 opacity-100 hover:opacity-80 transition-opacity">{t('auth.login')}</button></p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
