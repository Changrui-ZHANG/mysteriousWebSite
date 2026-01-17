
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaTrash, FaUndo } from 'react-icons/fa';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { StatusBadge } from './StatusBadge';
import { CommentSection } from './CommentSection';
import type { Suggestion, SuggestionUser } from '../types';

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
            className={`liquid-glass-card p-6 ${isArchived ? 'opacity-60 grayscale-[0.3]' : ''}`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        userId={suggestion.userId}
                        size="md"
                        className={isArchived ? 'grayscale opacity-80' : 'ring-2 ring-accent-secondary/20'}
                    />
                    <div>
                        <span className={`font-bold text-base ${isArchived ? 'text-accent-success' : 'text-primary'}`}>
                            {suggestion.username}
                        </span>
                        <span className="text-[11px] text-tertiary ml-3 font-mono font-medium">
                            {new Date(suggestion.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <StatusBadge status={suggestion.status} />
            </div>

            {/* Content */}
            <p className="text-primary/90 leading-relaxed mb-6 whitespace-pre-wrap text-[15px]">
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
