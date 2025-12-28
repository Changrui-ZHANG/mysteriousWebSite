import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import { postJson } from '../../api/httpClient';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: { userId: string; username: string }) => void;
    isDarkMode: boolean;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, isDarkMode }: AuthModalProps) {
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
            const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

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
                        className={`relative w-full max-w-md p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border backdrop-blur-md ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/10 border-white/30 text-gray-900'}`}
                        style={{
                            boxShadow: isDarkMode ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Shimmer/Reflection Effect */}
                        <div className={`absolute inset-0 rounded-2xl pointer-events-none ${isDarkMode ? 'bg-gradient-to-br from-white/10 to-transparent opacity-50' : 'bg-gradient-to-br from-white/40 to-transparent opacity-70'}`}></div>

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
                                        className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-current transition-all backdrop-blur-sm ${isDarkMode ? 'bg-black/20 border-white/10 focus:border-white/30 placeholder-white/30' : 'bg-white/40 border-white/40 focus:border-white/60 placeholder-gray-500'}`}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder={t('auth.password')}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-current transition-all backdrop-blur-sm ${isDarkMode ? 'bg-black/20 border-white/10 focus:border-white/30 placeholder-white/30' : 'bg-white/40 border-white/40 focus:border-white/60 placeholder-gray-500'}`}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all transform active:scale-[0.98] shadow-lg ${isDarkMode ? 'bg-white/90 text-black hover:bg-white' : 'bg-black/80 text-white hover:bg-black'}`}
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
