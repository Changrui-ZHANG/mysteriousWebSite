import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteRight, FaTrash } from 'react-icons/fa';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { fetchJson, postJson } from '../../../shared/api/httpClient';
import type { SuggestionComment, SuggestionUser } from '../types';

interface CommentSectionProps {
    suggestionId: string;
    commentCount?: number;
    user: SuggestionUser | null;
    isAdmin: boolean;
}

export function CommentSection({ suggestionId, commentCount = 0, user, isAdmin }: CommentSectionProps) {
    const { t } = useTranslation();
    const [comments, setComments] = useState<SuggestionComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [localCount, setLocalCount] = useState(commentCount);
    const [replyingTo, setReplyingTo] = useState<SuggestionComment | null>(null);

    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            const data = await fetchJson<SuggestionComment[]>(`/api/suggestions/${suggestionId}/comments`);
            setComments(data);
            setLocalCount(data.length);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        if (showComments) {
            fetchComments();
        }
    }, [showComments]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        try {
            await postJson(`/api/suggestions/${suggestionId}/comments`, {
                userId: user.userId,
                username: user.username,
                content: newComment.trim(),
                quotedCommentId: replyingTo?.id,
                quotedUsername: replyingTo?.username,
                quotedContent: replyingTo?.content,
            });
            setNewComment('');
            setReplyingTo(null);
            fetchComments();
        } catch (err) {
            console.error("Failed to post comment", err);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm(t('suggestions.delete_comment') + '?')) return;
        try {
            await fetchJson(`/api/suggestions/comments/${commentId}`, { method: 'DELETE' });
            fetchComments();
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const handleQuote = (comment: SuggestionComment) => {
        setReplyingTo(comment);
    };

    return (
        <div className="mt-6 pt-6 border-t border-default/50">
            <button
                onClick={() => setShowComments(!showComments)}
                className="text-sm font-black text-accent-secondary hover:text-accent-primary transition-colors mb-4 flex items-center gap-2 uppercase tracking-widest"
            >
                {t('suggestions.comments')} ({showComments ? t('suggestions.hide_comments') : localCount > 0 ? localCount : '0'})
            </button>

            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                    >
                        {loadingComments ? (
                            <div className="text-center py-4 text-tertiary">{t('game.loading')}</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-4 text-tertiary">{t('suggestions.no_comments')}</div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="p-4 comment-box">
                                    {comment.quotedContent && (
                                        <div className="mb-3 pl-4 border-l-2 border-accent-secondary/50 text-sm italic text-secondary">
                                            <span className="font-bold text-accent-secondary">{comment.quotedUsername}:</span> {comment.quotedContent}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 flex gap-3">
                                            <UserAvatar userId={comment.userId} size="sm" />
                                            <div>
                                                <span className="font-bold text-accent-secondary text-sm">{comment.username}</span>
                                                <span className="text-[10px] text-tertiary ml-3 font-mono">
                                                    {new Date(comment.timestamp).toLocaleString()}
                                                </span>
                                                <p className="mt-2 text-primary text-[14px] leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-2">
                                            <button
                                                onClick={() => handleQuote(comment)}
                                                className="text-accent-secondary hover:text-accent-primary transition-colors"
                                                title={t('suggestions.quote')}
                                            >
                                                <FaQuoteRight className="w-3 h-3" />
                                            </button>
                                            {(isAdmin || comment.userId === user?.userId) && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-accent-danger hover:text-red-400 transition-colors"
                                                    title={t('suggestions.delete_comment')}
                                                >
                                                    <FaTrash className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {user && (
                            <form onSubmit={handlePostComment} className="mt-4">
                                {replyingTo && (
                                    <div className="mb-3 p-3 rounded-xl reply-indicator text-sm flex justify-between items-center border border-accent-secondary/30">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar userId={replyingTo.userId} size="xs" />
                                            <div>
                                                <span className="text-secondary">{t('suggestions.replying_to')} </span>
                                                <span className="font-bold text-accent-secondary">{replyingTo.username}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setReplyingTo(null)}
                                            className="text-accent-danger hover:text-red-400 text-xs font-bold uppercase tracking-wider"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={t('suggestions.add_comment')}
                                    className="glass-input w-full p-4 resize-none transition-all"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-accent-secondary text-white font-bold text-sm disabled:opacity-30 disabled:scale-100 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/10"
                                    >
                                        {t('suggestions.post_comment')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}