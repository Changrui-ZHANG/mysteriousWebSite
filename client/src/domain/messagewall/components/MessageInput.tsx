import React, { useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaCog } from 'react-icons/fa';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { ImageUploader } from './ImageUploader';

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
    isAdmin: boolean;
    isGlobalMute: boolean;
    replyingTo: Message | null;
    onSubmit: (message: string, tempName: string, imageUrl?: string) => Promise<void>;
    onCancelReply: () => void;
    onOpenAdminPanel: () => void;
    showAdminPanel?: boolean;
    adminPanelContent?: ReactNode;
}

export const MessageInput = React.memo(function MessageInput({
    isAdmin,
    isGlobalMute,
    replyingTo,
    onSubmit,
    onCancelReply,
    onOpenAdminPanel,
    showAdminPanel = false,
    adminPanelContent
}: MessageInputProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);
    const [tempName, setTempName] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !uploadedImageUrl) || loading) return;

        setLoading(true);
        try {
            await onSubmit(newMessage.trim(), tempName.trim(), uploadedImageUrl || undefined);
            setNewMessage('');
            setUploadedImageUrl(null);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (imageUrl: string) => {
        setUploadedImageUrl(imageUrl);
    };

    const handleRemoveImage = () => {
        setUploadedImageUrl(null);
    };

    const isMuted = isGlobalMute && !isAdmin;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">

                {/* Admin Panel - Slides Above Input */}
                <AnimatePresence>
                    {showAdminPanel && adminPanelContent && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 20, height: 0 }}
                            className="mb-3 rounded-2xl bg-surface-translucent border border-default backdrop-blur-2xl p-4 shadow-2xl"
                        >
                            {adminPanelContent}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Input Container */}
                <div className={`
                    rounded-[1.75rem] bg-surface-translucent border border-default backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] 
                    relative after:absolute after:inset-0 after:rounded-[1.75rem] after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)] after:pointer-events-none
                    transition-all duration-300 hover:border-strong
                    ${isMuted ? 'opacity-50' : ''}
                `}>

                    {/* Muted Banner */}
                    {isMuted && (
                        <div className="text-center py-2 text-[10px] font-black uppercase tracking-widest text-accent-danger/80 border-b border-default">
                            {t('auth.muted')}
                        </div>
                    )}

                    {/* Replying To Banner */}
                    <AnimatePresence>
                        {replyingTo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between px-5 py-2.5 border-b border-default text-xs text-primary"
                            >
                                <span className="flex items-center gap-3 opacity-90 truncate">
                                    <span className="font-black uppercase tracking-wider opacity-50 text-[9px]">{t('messages.replying_to')}</span>
                                    <UserAvatar userId={replyingTo.userId} size="xs" className="ring-1 ring-accent-primary/30" />
                                    <span className="font-bold text-accent-primary">{replyingTo.name}</span>
                                    <span className="italic truncate max-w-[150px] opacity-70">"{replyingTo.message}"</span>
                                </span>
                                <button
                                    onClick={onCancelReply}
                                    className="w-6 h-6 rounded-lg bg-inset hover:bg-surface-alt text-secondary hover:text-primary transition-all flex items-center justify-center"
                                >
                                    <FaTimes className="text-[10px]" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Row */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">

                        {/* User Avatar or Name Toggle */}
                        {user ? (
                            <UserAvatar
                                userId={user.userId}
                                size="md"
                                className="ring-2 ring-accent-primary/20 shadow-lg"
                            />
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowNameInput(!showNameInput)}
                                    disabled={isMuted}
                                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center font-black text-xs ${showNameInput ? 'bg-accent-primary text-inverse shadow-lg scale-95' : 'bg-inset hover:bg-surface-alt text-secondary border border-default'}`}
                                >
                                    Aa
                                </button>
                                <AnimatePresence>
                                    {showNameInput && (
                                        <motion.input
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: 100, opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            placeholder={t('messages.name_placeholder')}
                                            maxLength={20}
                                            disabled={isMuted}
                                            className="bg-inset border border-default rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/30 placeholder:text-muted"
                                        />
                                    )}
                                </AnimatePresence>
                            </>
                        )}

                        {/* Main Input */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={isMuted ? t('auth.muted') : user ? t('messages.message_placeholder') : ''}
                                maxLength={200}
                                disabled={isMuted}
                                className={`w-full bg-inset border border-default rounded-2xl px-5 py-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 placeholder:text-muted transition-all ${isMuted ? 'cursor-not-allowed' : 'hover:bg-surface-alt'}`}
                            />

                            {/* Guest Login Prompt */}
                        </div>

                        {/* Image Upload Button */}
                        <ImageUploader
                            onUpload={handleImageUpload}
                            compact={true}
                            disabled={isMuted}
                            showPreview={false}
                            className="shrink-0"
                        />

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={(!newMessage.trim() && !uploadedImageUrl) || loading || isMuted}
                            className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-accent-primary to-accent-info hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 rounded-xl text-inverse transition-all shadow-lg shadow-accent-primary/20"
                        >
                            <FaPaperPlane className="text-sm" />
                        </button>

                        {/* Admin Toggle */}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={onOpenAdminPanel}
                                className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${showAdminPanel ? 'bg-accent-secondary text-inverse shadow-lg' : 'bg-inset hover:bg-surface-alt text-secondary border border-default'}`}
                            >
                                <FaCog className={`text-sm ${showAdminPanel ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </form>

                    {/* Image Preview */}
                    <AnimatePresence>
                        {uploadedImageUrl && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-3 pb-3"
                            >
                                <div className="relative inline-block">
                                    <img
                                        src={uploadedImageUrl}
                                        alt="Image à envoyer"
                                        className="max-h-32 rounded-lg border border-default"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-accent-danger text-white rounded-full flex items-center justify-center text-xs hover:scale-110 transition-transform"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
});
