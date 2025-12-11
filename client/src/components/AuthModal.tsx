import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';

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
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (authMode === 'login') {
                    onLoginSuccess({ userId: data.userId, username: data.username });
                    onClose();
                    setUsername('');
                    setPassword('');
                } else {
                    setAuthMode('login');
                    setSuccess(t('auth.success_register'));
                }
            } else {
                setError(data.message || t('auth.failed'));
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className={`w-full max-w-sm p-6 rounded-2xl shadow-xl ${isDarkMode ? 'bg-gray-900 border border-white/10 text-white' : 'bg-white text-black'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{authMode === 'login' ? t('auth.login') : t('auth.register')}</h2>
                            <button onClick={onClose} className="opacity-50 hover:opacity-100"><FaTimes /></button>
                        </div>

                        <form onSubmit={handleAuth} className="flex flex-col gap-4">
                            {error && <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded">{error}</div>}
                            {success && <div className="text-green-500 text-sm bg-green-500/10 p-2 rounded">{success}</div>}

                            <input
                                type="text"
                                placeholder={t('auth.username')}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className={`px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 ring-green-500 ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-100'}`}
                                required
                            />
                            <input
                                type="password"
                                placeholder={t('auth.password')}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className={`px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 ring-green-500 ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-100'}`}
                                required
                            />

                            <button type="submit" className="bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-400 transition-colors">
                                {authMode === 'login' ? t('auth.login') : t('auth.create_account')}
                            </button>
                        </form>

                        <div className="mt-4 text-center text-sm opacity-70">
                            {authMode === 'login' ? (
                                <p>{t('auth.no_account')} <button onClick={() => setAuthMode('register')} className="text-green-500 font-bold hover:underline">{t('auth.register')}</button></p>
                            ) : (
                                <p>{t('auth.has_account')} <button onClick={() => setAuthMode('login')} className="text-green-500 font-bold hover:underline">{t('auth.login')}</button></p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
