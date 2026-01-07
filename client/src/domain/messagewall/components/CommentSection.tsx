import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteRight, FaTrash } from 'react-icons/fa';
import { fetchJson, postJson } from '../../../shared/api/httpClient';
import type { SuggestionComment, SuggestionUser } from '../suggestions.types';

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
        <div className="mt-4 pt-4 border-t border-purple-500/20">
            <button
                onClick={() => setShowComments(!showComments)}
                className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors mb-2 flex items-center gap-2"
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
                            <div className="text-center py-4 opacity-60">{t('game.loading')}</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-4 opacity-60">{t('suggestions.no_comments')}</div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="p-3 rounded-lg comment-box">
                                    {comment.quotedContent && (
                                        <div className="mb-2 pl-3 border-l-2 border-purple-500/50 text-sm opacity-70 italic">
                                            <span className="font-bold">{comment.quotedUsername}:</span> {comment.quotedContent}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <span className="font-bold text-purple-400 text-sm">{comment.username}</span>
                                            <span className="text-xs opacity-60 ml-2">
                                                {new Date(comment.timestamp).toLocaleString()}
                                            </span>
                                            <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                        <div className="flex gap-2 ml-2">
                                            <button
                                                onClick={() => handleQuote(comment)}
                                                className="text-purple-400 hover:text-purple-300 transition-colors"
                                                title={t('suggestions.quote')}
                                            >
                                                <FaQuoteRight className="w-3 h-3" />
                                            </button>
                                            {(isAdmin || comment.userId === user?.userId) && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
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
                                    <div className="mb-2 p-2 rounded reply-indicator text-sm flex justify-between items-center">
                                        <div>
                                            <span className="opacity-70">{t('suggestions.replying_to')} </span>
                                            <span className="font-bold text-purple-400">{replyingTo.username}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setReplyingTo(null)}
                                            className="text-red-400 hover:text-red-300 text-xs"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={t('suggestions.add_comment')}
                                    className="input w-full p-3 resize-none"
                                    rows={2}
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="btn btn-primary mt-2 text-sm"
                                >
                                    {t('suggestions.post_comment')}
                                </button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
