import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaCheck, FaEye, FaTrash } from 'react-icons/fa';

interface Suggestion {
    id: string;
    userId: string;
    username: string;
    suggestion: string;
    timestamp: string;
    status: 'pending' | 'reviewed' | 'implemented';
}

interface User {
    userId: string;
    username: string;
}

interface SuggestionsPageProps {
    isDarkMode: boolean;
    user?: User | null;
    onOpenLogin: () => void;
    isAdmin?: boolean;
}

export function SuggestionsPage({ isDarkMode, user, onOpenLogin, isAdmin = false }: SuggestionsPageProps) {
    const { t } = useTranslation();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [newSuggestion, setNewSuggestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showArchive, setShowArchive] = useState(false);

    // Separate active and archived suggestions
    const activeSuggestions = suggestions.filter(s => s.status !== 'implemented');
    const archivedSuggestions = suggestions.filter(s => s.status === 'implemented');

    useEffect(() => {
        fetchSuggestions();
    }, [user, isAdmin]);

    const fetchSuggestions = async () => {
        try {
            const endpoint = isAdmin
                ? '/api/suggestions'
                : user ? `/api/suggestions/user/${user.userId}` : null;

            if (!endpoint) return;

            const response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
            }
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
            const response = await fetch('/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.userId,
                    username: user.username,
                    suggestion: newSuggestion.trim()
                })
            });

            if (response.ok) {
                setNewSuggestion('');
                fetchSuggestions();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to submit suggestion');
            }
        } catch (err) {
            setError('Error submitting suggestion');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const response = await fetch(`/api/suggestions/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchSuggestions();
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const deleteSuggestion = async (id: string) => {
        if (!confirm(t('suggestions.confirm_delete') || 'Delete this suggestion?')) return;

        try {
            const response = await fetch(`/api/suggestions/${id}?userId=${user?.userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchSuggestions();
            }
        } catch (err) {
            console.error('Failed to delete suggestion:', err);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: FaLightbulb, label: t('suggestions.pending') || 'Pending' },
            reviewed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: FaEye, label: t('suggestions.reviewed') || 'Reviewed' },
            implemented: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: FaCheck, label: t('suggestions.implemented') || 'Implemented' }
        };
        const badge = badges[status as keyof typeof badges] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const renderSuggestion = (suggestion: Suggestion, index: number, isArchived: boolean = false) => (
        <motion.div
            key={suggestion.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-6 rounded-xl backdrop-blur-md border ${isDarkMode ? 'bg-black/60 border-purple-500/30' : 'bg-white/80 border-purple-500/20'} ${isArchived ? 'opacity-75' : ''}`}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className={`font-bold ${isArchived ? 'text-green-400' : 'text-purple-400'}`}>{suggestion.username}</span>
                    <span className="text-sm opacity-60 ml-3">
                        {new Date(suggestion.timestamp).toLocaleDateString()}
                    </span>
                </div>
                {getStatusBadge(suggestion.status)}
            </div>
            <p className="mb-4 whitespace-pre-wrap">{suggestion.suggestion}</p>
            <div className="flex gap-2 flex-wrap">
                {isAdmin && !isArchived && (
                    <>
                        <button
                            onClick={() => updateStatus(suggestion.id, 'pending')}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-bold transition-colors"
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => updateStatus(suggestion.id, 'reviewed')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-colors"
                        >
                            Reviewed
                        </button>
                        <button
                            onClick={() => updateStatus(suggestion.id, 'implemented')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold transition-colors"
                        >
                            Implemented
                        </button>
                    </>
                )}
                {isAdmin && isArchived && (
                    <button
                        onClick={() => updateStatus(suggestion.id, 'pending')}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-bold transition-colors"
                    >
                        Reopen
                    </button>
                )}
                {(isAdmin || suggestion.userId === user?.userId) && (
                    <button
                        onClick={() => deleteSuggestion(suggestion.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs font-bold transition-colors flex items-center gap-1"
                    >
                        <FaTrash className="w-3 h-3" />
                        Delete
                    </button>
                )}
            </div>
        </motion.div>
    );

    const cardClass = `p-6 rounded-xl backdrop-blur-md border ${isDarkMode ? 'bg-black/60 border-purple-500/30' : 'bg-white/80 border-purple-500/20'}`;

    // Authentication gate - only logged in users can access
    if (!user) {
        return (
            <div className={`min-h-screen pt-24 pb-12 px-4 md:px-8 transition-colors duration-500 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-gray-900'}`}>
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center"
                    >
                        <div className={`p-12 rounded-xl backdrop-blur-md border ${isDarkMode ? 'bg-black/60 border-purple-500/30' : 'bg-white/80 border-purple-500/20'}`}>
                            <FaLightbulb className="w-20 h-20 mx-auto mb-6 text-purple-400" />
                            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 leading-tight pb-2">
                                {t('suggestions.title') || 'Suggestions & Ideas'}
                            </h1>
                            <p className="text-lg opacity-80 mb-8">
                                {t('suggestions.login_to_view') || 'Please log in to view and submit suggestions'}
                            </p>
                            <button
                                onClick={onOpenLogin}
                                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white transition-colors text-lg"
                            >
                                {t('auth.login') || 'Log In'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-24 pb-12 px-4 md:px-8 transition-colors duration-500 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 leading-tight pb-2">
                        {t('suggestions.title') || 'Suggestions & Ideas'}
                    </h1>
                    <p className="text-lg opacity-80">
                        {t('suggestions.subtitle') || 'Share your ideas to make this website better!'}
                    </p>
                </motion.div>

                {/* Submission Form */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`${cardClass} mb-8`}
                >
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FaLightbulb className="text-yellow-400" />
                        {t('suggestions.submit_new') || 'Submit a New Idea'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={newSuggestion}
                            onChange={(e) => setNewSuggestion(e.target.value)}
                            placeholder={t('suggestions.placeholder') || 'I would like to see more arcade games...'}
                            className={`w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            rows={4}
                            maxLength={1000}
                            disabled={!user}
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-sm opacity-60">
                                {newSuggestion.length}/1000
                            </span>
                            <button
                                type="submit"
                                disabled={loading || !user || !newSuggestion.trim()}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('suggestions.submitting') || 'Submitting...' : t('suggestions.submit') || 'Submit Idea'}
                            </button>
                        </div>
                        {!user && (
                            <p className="text-sm text-yellow-400">
                                {t('suggestions.login_required') || 'Please log in to submit suggestions'}
                            </p>
                        )}
                        {error && <p className="text-sm text-red-400">{error}</p>}
                    </form>
                </motion.div>

                {/* Active Suggestions List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">
                            {isAdmin ? (t('suggestions.all_suggestions') || 'All Suggestions') : (t('suggestions.your_suggestions') || 'Your Suggestions')}
                        </h2>
                        {archivedSuggestions.length > 0 && (
                            <button
                                onClick={() => setShowArchive(!showArchive)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white transition-colors flex items-center gap-2"
                            >
                                <FaCheck className="w-4 h-4" />
                                {showArchive ? (t('suggestions.hide_archive') || 'Hide Archive') : `${t('suggestions.show_archive') || 'Show Archive'} (${archivedSuggestions.length})`}
                            </button>
                        )}
                    </div>

                    {!showArchive && (
                        <>
                            <AnimatePresence mode="popLayout">
                                {activeSuggestions.map((suggestion, index) => renderSuggestion(suggestion, index, false))}
                            </AnimatePresence>
                            {activeSuggestions.length === 0 && (
                                <div className={`${cardClass} text-center py-12 opacity-60`}>
                                    <FaLightbulb className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                                    <p>{t('suggestions.no_suggestions') || 'No suggestions yet. Be the first to share an idea!'}</p>
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
                            {t('suggestions.archive') || 'Archive'} ({archivedSuggestions.length})
                        </h2>
                        <AnimatePresence mode="popLayout">
                            {archivedSuggestions.map((suggestion, index) => renderSuggestion(suggestion, index, true))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
