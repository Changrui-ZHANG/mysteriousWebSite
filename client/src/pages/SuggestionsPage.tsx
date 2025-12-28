import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaCheck } from 'react-icons/fa';
import { fetchJson, postJson } from '../api/httpClient';
import { API_ENDPOINTS } from '../constants/endpoints';
import { useTheme } from '../hooks/useTheme';
import { GradientHeading, Button, GlassCard } from '../components';
import { SuggestionCard } from '../components/suggestions';
import type { Suggestion, SuggestionUser } from '../types/suggestions';

interface SuggestionsPageProps {
    isDarkMode: boolean;
    user?: SuggestionUser | null;
    onOpenLogin: () => void;
    isAdmin?: boolean;
}

export function SuggestionsPage({ isDarkMode, user, onOpenLogin, isAdmin = false }: SuggestionsPageProps) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
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
            await fetchJson(API_ENDPOINTS.SUGGESTIONS.DELETE(parseInt(id)), { method: 'DELETE' });
            fetchSuggestions();
        } catch (err) {
            console.error('Failed to delete suggestion:', err);
        }
    };

    const handleReopen = (id: string) => {
        updateStatus(id, 'pending');
        setShowArchive(false);
    };

    const cardClass = theme.glassCard('purple');

    // Authentication gate
    if (!user) {
        return (
            <div className={`min-h-screen pt-24 pb-12 px-4 md:px-8 transition-colors duration-500 ${theme.bgPage} ${theme.textPrimary}`}>
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
                        <GlassCard isDarkMode={isDarkMode} accentColor="purple" padding="lg" animated={false}>
                            <FaLightbulb className="w-20 h-20 mx-auto mb-6 text-purple-400" />
                            <GradientHeading gradient="purple-pink" level={1} className="mb-4">
                                {t('suggestions.title')}
                            </GradientHeading>
                            <p className="text-lg opacity-80 mb-8">
                                {t('suggestions.login_to_view')}
                            </p>
                            <Button color="purple" size="lg" onClick={onOpenLogin}>
                                {t('auth.login')}
                            </Button>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-24 pb-12 px-4 md:px-8 transition-colors duration-500 ${theme.bgPage} ${theme.textPrimary}`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
                    <GradientHeading gradient="purple-pink" level={1} className="mb-4">
                        {t('suggestions.title')}
                    </GradientHeading>
                    <p className="text-lg opacity-80">
                        {t('suggestions.subtitle')}
                    </p>
                </motion.div>

                {/* Submission Form */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={`${cardClass} mb-8`}>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FaLightbulb className="text-yellow-400" />
                        {t('suggestions.submit_new')}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={newSuggestion}
                            onChange={(e) => setNewSuggestion(e.target.value)}
                            placeholder={t('suggestions.placeholder')}
                            className={`w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            rows={4}
                            maxLength={1000}
                            disabled={!user}
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-sm opacity-60">{newSuggestion.length}/1000</span>
                            <button
                                type="submit"
                                disabled={loading || !user || !newSuggestion.trim()}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('suggestions.submitting') : t('suggestions.submit')}
                            </button>
                        </div>
                        {error && <p className="text-sm text-red-400">{error}</p>}
                    </form>
                </motion.div>

                {/* Suggestions List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            {isAdmin ? t('suggestions.all_suggestions') : t('suggestions.your_suggestions')}
                        </h2>
                        {archivedSuggestions.length > 0 && (
                            <button
                                onClick={() => setShowArchive(!showArchive)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white transition-colors flex items-center gap-2"
                            >
                                <FaCheck className="w-4 h-4" />
                                {showArchive ? t('suggestions.hide_archive') : `${t('suggestions.show_archive')} (${archivedSuggestions.length})`}
                            </button>
                        )}
                    </div>

                    {!showArchive && (
                        <>
                            <AnimatePresence mode="popLayout">
                                {activeSuggestions.map((suggestion, index) => (
                                    <SuggestionCard
                                        key={suggestion.id}
                                        suggestion={suggestion}
                                        index={index}
                                        isDarkMode={isDarkMode}
                                        user={user}
                                        isAdmin={isAdmin}
                                        onUpdateStatus={updateStatus}
                                        onDelete={deleteSuggestion}
                                    />
                                ))}
                            </AnimatePresence>
                            {activeSuggestions.length === 0 && (
                                <div className={`${cardClass} text-center py-12 opacity-60`}>
                                    <FaLightbulb className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                                    <p>{t('suggestions.no_suggestions')}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Archive Section */}
                {showArchive && archivedSuggestions.length > 0 && (
                    <div className="space-y-4 mt-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <FaCheck className="text-green-400" />
                            {t('suggestions.archive')} ({archivedSuggestions.length})
                        </h2>
                        <AnimatePresence mode="popLayout">
                            {archivedSuggestions.map((suggestion, index) => (
                                <SuggestionCard
                                    key={suggestion.id}
                                    suggestion={suggestion}
                                    index={index}
                                    isArchived={true}
                                    isDarkMode={isDarkMode}
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
