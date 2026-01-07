import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaTrash, FaUndo } from 'react-icons/fa';
import { StatusBadge } from './StatusBadge';
import { CommentSection } from './CommentSection';
import type { Suggestion, SuggestionUser } from '../suggestions.types';

interface SuggestionCardProps {
    suggestion: Suggestion;
    index: number;
    isArchived?: boolean;
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
            transition={{ delay: index * 0.03 }}
            className={`relative rounded-2xl bg-white/[0.02] border backdrop-blur-xl p-6 transition-all hover:bg-white/[0.04] after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)] after:pointer-events-none ${isArchived ? 'border-accent-success/20 opacity-70' : 'border-white/10'}`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${isArchived ? 'bg-accent-success/20 text-accent-success' : 'bg-gradient-to-br from-accent-secondary to-accent-primary text-white'}`}>
                        {suggestion.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <span className={`font-bold text-sm ${isArchived ? 'text-accent-success' : 'text-white'}`}>
                            {suggestion.username}
                        </span>
                        <span className="text-[10px] text-white/30 ml-2 font-mono">
                            {new Date(suggestion.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <StatusBadge status={suggestion.status} />
            </div>

            {/* Content */}
            <p className="text-white/80 leading-relaxed mb-5 whitespace-pre-wrap">
                {suggestion.suggestion}
            </p>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
                {isAdmin && !isArchived && (
                    <>
                        <button
                            onClick={() => onUpdateStatus(suggestion.id, 'pending')}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-accent-warning/20 border border-accent-warning/30 text-accent-warning hover:bg-accent-warning/30 transition-all"
                        >
                            {t('suggestions.status_pending')}
                        </button>
                        <button
                            onClick={() => onUpdateStatus(suggestion.id, 'reviewed')}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-accent-info/20 border border-accent-info/30 text-accent-info hover:bg-accent-info/30 transition-all"
                        >
                            {t('suggestions.status_reviewed')}
                        </button>
                        <button
                            onClick={() => onUpdateStatus(suggestion.id, 'implemented')}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-accent-success/20 border border-accent-success/30 text-accent-success hover:bg-accent-success/30 transition-all"
                        >
                            {t('suggestions.status_implemented')}
                        </button>
                    </>
                )}
                {isAdmin && isArchived && onReopen && (
                    <button
                        onClick={() => onReopen(suggestion.id)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-accent-warning/20 border border-accent-warning/30 text-accent-warning hover:bg-accent-warning/30 transition-all flex items-center gap-1.5"
                    >
                        <FaUndo className="text-[8px]" />
                        {t('suggestions.reopen')}
                    </button>
                )}

                {(isAdmin || suggestion.userId === user?.userId) && (
                    <button
                        onClick={() => onDelete(suggestion.id)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-accent-danger/20 border border-accent-danger/30 text-accent-danger hover:bg-accent-danger/30 transition-all flex items-center gap-1.5 ml-auto"
                    >
                        <FaTrash className="text-[8px]" />
                        {t('common.delete')}
                    </button>
                )}
            </div>

            {/* Comments */}
            <CommentSection
                suggestionId={suggestion.id}
                commentCount={suggestion.commentCount}
                user={user}
                isAdmin={isAdmin}
            />
        </motion.div>
    );
}
