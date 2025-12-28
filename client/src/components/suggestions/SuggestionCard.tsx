import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';
import { StatusBadge } from './StatusBadge';
import { CommentSection } from './CommentSection';
import type { Suggestion, SuggestionUser } from '../../types/suggestions';

interface SuggestionCardProps {
    suggestion: Suggestion;
    index: number;
    isArchived?: boolean;
    isDarkMode: boolean;
    user: SuggestionUser | null;
    isAdmin: boolean;
    onUpdateStatus: (id: string, status: string) => void;
    onDelete: (id: string) => void;
    onReopen?: (id: string) => void;
}

export function SuggestionCard({
    suggestion,
    index,
    isArchived = false,
    isDarkMode,
    user,
    isAdmin,
    onUpdateStatus,
    onDelete,
    onReopen
}: SuggestionCardProps) {
    const { t } = useTranslation();

    return (
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
                <StatusBadge status={suggestion.status} />
            </div>
            <p className="mb-4 whitespace-pre-wrap">{suggestion.suggestion}</p>
            <div className="flex gap-2 flex-wrap">
                {isAdmin && !isArchived && (
                    <>
                        <button
                            onClick={() => onUpdateStatus(suggestion.id, 'pending')}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-bold transition-colors"
                        >
                            {t('suggestions.status_pending') || 'Pending'}
                        </button>
                        <button
                            onClick={() => onUpdateStatus(suggestion.id, 'reviewed')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-colors"
                        >
                            {t('suggestions.status_reviewed') || 'Reviewed'}
                        </button>
                        <button
                            onClick={() => onUpdateStatus(suggestion.id, 'implemented')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold transition-colors"
                        >
                            {t('suggestions.status_implemented') || 'Implemented'}
                        </button>
                    </>
                )}
                {isAdmin && isArchived && onReopen && (
                    <button
                        onClick={() => onReopen(suggestion.id)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-bold transition-colors"
                    >
                        {t('suggestions.reopen') || 'Reopen'}
                    </button>
                )}

                {(isAdmin || suggestion.userId === user?.userId) && (
                    <button
                        onClick={() => onDelete(suggestion.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs font-bold transition-colors flex items-center gap-1"
                    >
                        <FaTrash className="w-3 h-3" />
                        {t('common.delete')}
                    </button>
                )}
            </div>
            <CommentSection
                suggestionId={suggestion.id}
                commentCount={suggestion.commentCount}
                user={user}
                isDarkMode={isDarkMode}
                isAdmin={isAdmin}
            />
        </motion.div>
    );
}
