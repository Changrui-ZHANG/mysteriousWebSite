import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface User {
    userId: string;
    username: string;
}

interface Message {
    id: string;
    userId: string;
    name: string;
    message: string;
    timestamp: number;
    isAnonymous: boolean;
    isVerified: boolean;
    quotedMessageId?: string;
    quotedName?: string;
    quotedMessage?: string;
}

interface MessageInputProps {
    user: User | null;
    isAdmin: boolean;
    isGlobalMute: boolean;
    replyingTo: Message | null;
    onSubmit: (message: string, tempName: string) => Promise<void>;
    onCancelReply: () => void;
    onOpenLogin: () => void;
    onOpenAdminPanel: () => void;
}

export function MessageInput({
    user,
    isAdmin,
    isGlobalMute,
    replyingTo,
    onSubmit,
    onCancelReply,
    onOpenLogin,
    onOpenAdminPanel
}: MessageInputProps) {
    const { t } = useTranslation();
    const [newMessage, setNewMessage] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);
    const [tempName, setTempName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || loading) return;

        setLoading(true);
        try {
            await onSubmit(newMessage.trim(), tempName.trim());
            setNewMessage('');
        } finally {
            setLoading(false);
        }
    };

    const isMuted = isGlobalMute && !isAdmin;

    return (
        <div className="message-input-bar pb-[env(safe-area-inset-bottom)]">
            {isMuted && (
                <div className="bg-red-500/10 text-red-500 text-xs text-center py-1">
                    {t('auth.muted')}
                </div>
            )}
            <div className={`max-w-4xl mx-auto p-3 ${isMuted ? 'opacity-50' : ''}`}>
                {replyingTo && (
                    <div className="quote-block mb-2 flex justify-between items-center">
                        <span>
                            <span className="font-bold mr-1">{t('messages.replying_to')} {replyingTo.name}:</span>
                            <span className="italic truncate max-w-[200px] inline-block align-bottom">{replyingTo.message}</span>
                        </span>
                        <button
                            onClick={onCancelReply}
                            className="text-red-400 hover:text-red-300 ml-2 font-bold px-2"
                            aria-label={t('common.cancel')}
                        >
                            ✕
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
                    {/* User Identity Display */}
                    {user && (
                        <div className="p-2 rounded-lg flex items-center gap-2 ring-1 ring-accent-success/30 bg-accent-success/10 text-accent-success transition-all">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}

                    {/* Manual Name Input (Only if not logged in) */}
                    {!user && (
                        <>
                            <button
                                type="button"
                                onClick={() => setShowNameInput(!showNameInput)}
                                disabled={isMuted}
                                className={`p-2 rounded-lg transition-colors ${showNameInput ? 'bg-green-500 text-white' : 'icon-btn-themed'}`}
                                aria-label={t('messages.set_name')}
                            >
                                Aa
                            </button>
                            {showNameInput && (
                                <motion.input
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    placeholder={t('messages.name_placeholder')}
                                    maxLength={20}
                                    disabled={isMuted}
                                    className="input-themed px-3 py-2 text-base md:text-sm w-20 md:w-28"
                                />
                            )}
                        </>
                    )}

                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isMuted ? t('auth.muted') : user ? t('messages.message_placeholder') : ''}
                            maxLength={200}
                            disabled={isMuted}
                            className={`input-themed w-full px-4 py-2 ${isMuted ? 'cursor-not-allowed' : ''}`}
                        />

                        {/* Interactive Placeholder for Guests */}
                        {!user && !newMessage && !isMuted && (
                            <div className="absolute inset-0 px-4 py-2 pointer-events-none flex items-center text-muted">
                                <span>{t('messages.guest_placeholder_text')}</span>
                                <button
                                    type="button"
                                    onClick={onOpenLogin}
                                    className="pointer-events-auto hover:underline font-bold text-green-500 ml-1 focus:outline-none"
                                >
                                    {t('messages.guest_placeholder_link')}
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || loading || isMuted}
                        className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-30 rounded-lg text-white"
                        aria-label={t('messages.send')}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>

                    {isAdmin && (
                        <button
                            type="button"
                            onClick={onOpenAdminPanel}
                            className="icon-btn-themed p-2 text-xs"
                            aria-label={t('admin.panel')}
                        >
                            🔐
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
