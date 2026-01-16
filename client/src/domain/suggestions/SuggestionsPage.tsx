import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaCheck, FaPaperPlane } from 'react-icons/fa';
import { fetchJson, postJson } from '../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../shared/constants/endpoints';
import { useAuth } from '../../shared/contexts/AuthContext';
import { LoginRequired } from '../../shared/components';
import { SuggestionCard } from './components/SuggestionCard';
import type { Suggestion } from './types';

interface SuggestionsPageProps {
}

export function SuggestionsPage({ }: SuggestionsPageProps) {
    const { t } = useTranslation();
    const { user, isAdmin } = useAuth();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [newSuggestion, setNewSuggestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showArchive, setShowArchive] = useState(false);

    const activeSuggestions = suggestions.filter(s => s.status !== 'implemented');
    const archivedSuggestions = suggestions.filter(s => s.status === 'implemented');

    useEffect(() => {
        fetchSuggestions();
    }, [user, isAdmin]);

    const fetchSuggestions = async () => {
        try {
            const endpoint = (isAdmin || !user)
                ? API_ENDPOINTS.SUGGESTIONS.LIST
                : `/api/suggestions/user/${user.userId}`;

            const data = await fetchJson<Suggestion[]>(endpoint);
            setSuggestions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch suggestions:', err);
            setSuggestions([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newSuggestion.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await postJson(API_ENDPOINTS.SUGGESTIONS.ADD, {
                userId: user.userId,
                username: user.username,
                suggestion: newSuggestion.trim()
            });

            setNewSuggestion('');
            fetchSuggestions();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('suggestions.submit_failed');
            setError(errorMessage);
            console.error('Failed to submit suggestion:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/suggestions/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchSuggestions();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const deleteSuggestion = async (id: string) => {
        if (!window.confirm(t('suggestions.confirm_delete'))) return;

        try {
            await fetchJson(API_ENDPOINTS.SUGGESTIONS.DELETE(id), { method: 'DELETE' });
            fetchSuggestions();
        } catch (err) {
            console.error('Failed to delete suggestion:', err);
        }
    };

    const handleReopen = (id: string) => {
        updateStatus(id, 'pending');
        setShowArchive(false);
    };

    const content = (
        <div className="page-container min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-10"
                >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-accent-secondary mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-amber-500/20 rotate-3">
                        <FaLightbulb className="text-3xl text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-accent-secondary tracking-tight">
                        {t('suggestions.title')}
                    </h1>
                    <p className="text-secondary max-w-lg mx-auto leading-relaxed">
                        {t('suggestions.subtitle')}
                    </p>
                </motion.div>

                {/* Submission Form - Liquid Glass Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="liquid-glass-panel mb-12"
                >
                    <div className="p-8 md:p-10">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-primary">
                            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <FaLightbulb className="text-white text-xl" />
                            </span>
                            {t('suggestions.submit_new')}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="relative">
                                <textarea
                                    value={newSuggestion}
                                    onChange={(e) => setNewSuggestion(e.target.value)}
                                    placeholder={t('suggestions.placeholder')}
                                    className="glass-input w-full px-6 py-5 resize-none transition-all text-lg"
                                    rows={5}
                                    maxLength={1000}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-tertiary font-mono font-medium">{newSuggestion.length}/1000</span>
                                <button
                                    type="submit"
                                    disabled={loading || !newSuggestion.trim()}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-accent-secondary text-white font-bold text-sm disabled:opacity-30 disabled:scale-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
                                >
                                    <FaPaperPlane className="text-xs" />
                                    {loading ? t('suggestions.submitting') : t('suggestions.submit')}
                                </button>
                            </div>
                            {error && <p className="text-sm text-accent-danger">{error}</p>}
                        </form>
                    </div>
                </motion.div>

                {/* Suggestions List Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-primary tracking-tight">
                        {isAdmin ? t('suggestions.all_suggestions') : t('suggestions.your_suggestions')}
                    </h2>
                    {archivedSuggestions.length > 0 && (
                        <button
                            onClick={() => setShowArchive(!showArchive)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border ${showArchive ? 'bg-accent-success/20 border-accent-success/30 text-accent-success' : 'bg-surface-translucent border-default text-secondary hover:bg-surface-alt'}`}
                        >
                            <FaCheck className="text-[10px]" />
                            {showArchive ? t('suggestions.hide_archive') : `${t('suggestions.show_archive')} (${archivedSuggestions.length})`}
                        </button>
                    )}
                </div>

                {/* Active Suggestions */}
                {!showArchive && (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {activeSuggestions.map((suggestion, index) => (
                                <motion.div key={suggestion.id} layout>
                                    <SuggestionCard
                                        suggestion={suggestion}
                                        index={index}
                                        user={user ?? null}
                                        isAdmin={isAdmin}
                                        onUpdateStatus={updateStatus}
                                        onDelete={deleteSuggestion}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {activeSuggestions.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="liquid-glass-card text-center py-20 text-tertiary"
                            >
                                <FaLightbulb className="w-16 h-16 mx-auto mb-6 text-tertiary/40" />
                                <p className="text-lg font-medium">{t('suggestions.no_suggestions')}</p>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Archive Section */}
                {showArchive && archivedSuggestions.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 rounded-lg bg-accent-success/20 flex items-center justify-center">
                                <FaCheck className="text-accent-success text-sm" />
                            </span>
                            <h3 className="text-lg font-bold text-accent-success">
                                {t('suggestions.archive')} ({archivedSuggestions.length})
                            </h3>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {archivedSuggestions.map((suggestion, index) => (
                                <motion.div key={suggestion.id} layout>
                                    <SuggestionCard
                                        suggestion={suggestion}
                                        index={index}
                                        isArchived={true}
                                        user={user ?? null}
                                        isAdmin={isAdmin}
                                        onUpdateStatus={updateStatus}
                                        onDelete={deleteSuggestion}
                                        onReopen={handleReopen}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <LoginRequired
            title={t('suggestions.login_required_title')}
            description={t('suggestions.login_required_description')}
            icon={<FaLightbulb className="text-2xl" />}
        >
            {content}
        </LoginRequired>
    );
}