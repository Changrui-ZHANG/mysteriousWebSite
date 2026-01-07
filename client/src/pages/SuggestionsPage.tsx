import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaCheck, FaPaperPlane } from 'react-icons/fa';
import { fetchJson, postJson } from '../api/httpClient';
import { API_ENDPOINTS } from '../constants/endpoints';
import { SuggestionCard } from '../features/suggestions/components';
import type { Suggestion, SuggestionUser } from '../types/suggestions';

interface SuggestionsPageProps {
    user?: SuggestionUser | null;
    onOpenLogin: () => void;
    isAdmin?: boolean;
}

export function SuggestionsPage({ user, onOpenLogin, isAdmin = false }: SuggestionsPageProps) {
    const { t } = useTranslation();
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
            const endpoint = isAdmin
                ? API_ENDPOINTS.SUGGESTIONS.LIST
                : user ? `/api/suggestions/user/${user.userId}` : null;

            if (!endpoint) return;

            const data = await fetchJson<Suggestion[]>(endpoint);
            setSuggestions(data);
        } catch (err) {
            console.error('Failed to fetch suggestions:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            onOpenLogin();
            return;
        }

        if (!newSuggestion.trim()) return;

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

    // Authentication gate - Liquid Glass style
    if (!user) {
        return (
            <div className="page-container min-h-screen pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full"
                >
                    <div className="relative rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] p-10 text-center after:absolute after:inset-0 after:rounded-[2rem] after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)] after:pointer-events-none">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-secondary to-accent-primary mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-accent-secondary/30">
                            <FaLightbulb className="text-4xl text-white" />
                        </div>
                        <h1 className="text-3xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-accent-secondary to-accent-primary">
                            {t('suggestions.title')}
                        </h1>
                        <p className="text-white/60 mb-8">
                            {t('suggestions.login_to_view')}
                        </p>
                        <button
                            onClick={onOpenLogin}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent-secondary to-accent-primary text-white font-bold shadow-lg shadow-accent-secondary/30 hover:scale-105 active:scale-95 transition-transform"
                        >
                            {t('auth.login')}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="page-container min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-10"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-primary mx-auto mb-4 flex items-center justify-center shadow-2xl shadow-accent-secondary/30">
                        <FaLightbulb className="text-2xl text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-accent-secondary to-accent-primary">
                        {t('suggestions.title')}
                    </h1>
                    <p className="text-white/50">
                        {t('suggestions.subtitle')}
                    </p>
                </motion.div>

                {/* Submission Form - Liquid Glass Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-[1.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.3)] mb-10 overflow-hidden after:absolute after:inset-0 after:rounded-[1.5rem] after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.08)] after:pointer-events-none"
                >
                    <div className="p-8">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                <FaLightbulb className="text-white" />
                            </span>
                            {t('suggestions.submit_new')}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <textarea
                                value={newSuggestion}
                                onChange={(e) => setNewSuggestion(e.target.value)}
                                placeholder={t('suggestions.placeholder')}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent-secondary/30 resize-none transition-all"
                                rows={4}
                                maxLength={1000}
                                disabled={!user}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/30 font-mono">{newSuggestion.length}/1000</span>
                                <button
                                    type="submit"
                                    disabled={loading || !user || !newSuggestion.trim()}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-secondary to-accent-primary text-white font-bold text-sm disabled:opacity-30 disabled:scale-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-accent-secondary/20"
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
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black">
                        {isAdmin ? t('suggestions.all_suggestions') : t('suggestions.your_suggestions')}
                    </h2>
                    {archivedSuggestions.length > 0 && (
                        <button
                            onClick={() => setShowArchive(!showArchive)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${showArchive ? 'bg-accent-success/20 border-accent-success/30 text-accent-success' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
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
                                <SuggestionCard
                                    key={suggestion.id}
                                    suggestion={suggestion}
                                    index={index}
                                    user={user}
                                    isAdmin={isAdmin}
                                    onUpdateStatus={updateStatus}
                                    onDelete={deleteSuggestion}
                                />
                            ))}
                        </AnimatePresence>
                        {activeSuggestions.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl text-center py-16 text-white/30"
                            >
                                <FaLightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>{t('suggestions.no_suggestions')}</p>
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
                                <SuggestionCard
                                    key={suggestion.id}
                                    suggestion={suggestion}
                                    index={index}
                                    isArchived={true}
                                    user={user}
                                    isAdmin={isAdmin}
                                    onUpdateStatus={updateStatus}
                                    onDelete={deleteSuggestion}
                                    onReopen={handleReopen}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
