import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaUser, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { postJson } from '../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../shared/constants/endpoints';

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
    const [gender, setGender] = useState<string>('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const endpoint = authMode === 'login' ? API_ENDPOINTS.AUTH.LOGIN : API_ENDPOINTS.AUTH.REGISTER;

            const payload = authMode === 'login'
                ? { username, password }
                : { username, password, gender: gender || null };

            const data = await postJson<{ userId: string; username: string; message: string }>(endpoint, payload);

            if (authMode === 'login') {
                onLoginSuccess({ userId: data.userId, username: data.username });
                onClose();
                setUsername('');
                setPassword('');
            } else {
                setAuthMode('login');
                setSuccess(t('auth.success_register'));
                setGender('');
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
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[70]"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.6)] overflow-hidden after:absolute after:inset-0 after:rounded-[2rem] after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)] after:pointer-events-none"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Animated Background Glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full blur-[80px] opacity-30 animate-pulse" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-accent-info to-accent-primary rounded-full blur-[80px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all group"
                            aria-label={t('common.close')}
                        >
                            <FaTimes className="text-sm group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        {/* Content */}
                        <div className="relative z-10 p-10">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl ${authMode === 'login' ? 'bg-gradient-to-br from-accent-primary to-accent-info shadow-accent-primary/30' : 'bg-gradient-to-br from-accent-secondary to-accent-primary shadow-accent-secondary/30'}`}>
                                    {authMode === 'login' ? <FaSignInAlt className="text-2xl text-white" /> : <FaUserPlus className="text-2xl text-white" />}
                                </div>
                                <h2 className={`text-2xl font-black bg-clip-text text-transparent ${authMode === 'login' ? 'bg-gradient-to-r from-accent-primary to-accent-info' : 'bg-gradient-to-r from-accent-secondary to-accent-primary'}`}>
                                    {authMode === 'login' ? t('auth.login') : t('auth.register')}
                                </h2>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleAuth} className="space-y-5">
                                {/* Error/Success Messages */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-accent-danger text-sm bg-accent-danger/10 px-4 py-3 rounded-xl border border-accent-danger/20 text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-accent-success text-sm bg-accent-success/10 px-4 py-3 rounded-xl border border-accent-success/20 text-center"
                                    >
                                        {success}
                                    </motion.div>
                                )}

                                {/* Inputs */}
                                <div className="space-y-4">
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm" />
                                        <input
                                            type="text"
                                            placeholder={t('auth.username')}
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-white/20 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm" />
                                        <input
                                            type="password"
                                            placeholder={t('auth.password')}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-white/20 transition-all"
                                            required
                                        />
                                    </div>

                                    {authMode === 'register' && (
                                        <div className="flex space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => setGender('H')}
                                                className={`flex-1 py-3 rounded-xl border transition-all ${gender === 'H' ? 'bg-accent-primary/20 border-accent-primary text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                            >
                                                {t('profile.gender.male')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setGender('F')}
                                                className={`flex-1 py-3 rounded-xl border transition-all ${gender === 'F' ? 'bg-accent-secondary/20 border-accent-secondary text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                            >
                                                {t('profile.gender.female')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setGender('')}
                                                className={`flex-1 py-3 rounded-xl border transition-all ${gender === '' ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                            >
                                                {t('profile.gender.not_specified')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${authMode === 'login' ? 'bg-gradient-to-r from-accent-primary to-accent-info shadow-accent-primary/30' : 'bg-gradient-to-r from-accent-secondary to-accent-primary shadow-accent-secondary/30'}`}
                                >
                                    {authMode === 'login' ? t('auth.login') : t('auth.create_account')}
                                </button>
                            </form>

                            {/* Switch Mode */}
                            <div className="mt-8 text-center text-sm text-white/40">
                                {authMode === 'login' ? (
                                    <p>
                                        {t('auth.no_account')}{' '}
                                        <button
                                            onClick={() => setAuthMode('register')}
                                            className="font-bold text-accent-secondary hover:text-white transition-colors"
                                        >
                                            {t('auth.register')}
                                        </button>
                                    </p>
                                ) : (
                                    <p>
                                        {t('auth.has_account')}{' '}
                                        <button
                                            onClick={() => setAuthMode('login')}
                                            className="font-bold text-accent-primary hover:text-white transition-colors"
                                        >
                                            {t('auth.login')}
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
