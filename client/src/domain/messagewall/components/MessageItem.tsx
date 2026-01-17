import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaLanguage, FaSpinner, FaReply, FaTrash, FaUserSecret, FaSmile } from 'react-icons/fa';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import { MessageReactions } from './MessageReactions';
import { useReactions } from '../hooks/useReactions';
import { QUICK_REACTIONS } from '../types/reaction.types';
import type { Message } from '../types';
import type { Reaction } from '../types/reaction.types';

interface MessageItemProps {
    msg: Message;
    index: number;
    isOwn: boolean;
    isHighlighted: boolean;
    canDelete: boolean;
    translation?: string;
    isTranslating: boolean;
    showTranslation: boolean;
    onDelete: (id: string) => void;
    onReply: (msg: Message) => void;
    onTranslate: (id: string, text: string) => void;
    onScrollToMessage: (id: string) => void;
    onReactionUpdate?: (messageId: string, reactions: Reaction[]) => void;
}

export const MessageItem = React.forwardRef<HTMLDivElement, MessageItemProps>(({
    msg,
    index,
    isOwn,
    isHighlighted,
    canDelete,
    translation,
    isTranslating,
    showTranslation,
    onDelete,
    onReply,
    onTranslate,
    onScrollToMessage,
    onReactionUpdate,
}, ref) => {
    const { t } = useTranslation();
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    // Hook pour gérer les réactions - une seule instance par message
    const reactionHook = useReactions({
        messageId: msg.id,
        initialReactions: msg.reactions || [],
        onReactionUpdate: onReactionUpdate ? (reactions) => onReactionUpdate(msg.id, reactions) : undefined
    });

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        if (diff < 60000) return t('messages.just_now');
        if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getInitials = (name: string, isAnon: boolean) => {
        if (isAnon) return '?';
        return name.charAt(0).toUpperCase();
    };

    return (
        <motion.div
            ref={ref}
            id={`message-${msg.id}`}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: isHighlighted ? 1.02 : 1
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.02, type: 'spring', damping: 20 }}
            className={`flex gap-3 items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isHighlighted ? 'ring-2 ring-accent-primary/30 rounded-2xl' : ''}`}
        >
            {/* Avatar */}
            <UserAvatar
                userId={msg.isAnonymous ? undefined : msg.userId}
                size="sm"
                className={`flex-shrink-0 shadow-lg ring-2 ${isOwn
                    ? 'ring-accent-primary/20'
                    : msg.isAnonymous
                        ? 'ring-default/50 grayscale'
                        : 'ring-accent-secondary/20'}`}
                alt={msg.name}
            >
                {msg.isAnonymous && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inset text-muted">
                        <FaUserSecret className="text-xs" />
                    </div>
                )}
            </UserAvatar>

            {/* Message Content */}
            <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Meta Info */}
                <div className={`flex items-center gap-2 text-[10px] opacity-50 mb-1.5 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="flex items-center gap-1 font-bold uppercase tracking-wider">
                        {isOwn ? t('messages.you') : msg.name}
                        {msg.isVerified && <FaCheckCircle className="text-accent-success text-[8px]" />}
                    </span>
                    <span className="opacity-50">•</span>
                    <span className="font-mono">{formatTimestamp(msg.timestamp)}</span>
                </div>

                {/* Bubble */}
                <div className={`
                    relative px-4 py-3 rounded-2xl backdrop-blur-xl transition-all duration-300 group shadow-lg
                    ${isOwn
                        ? 'bg-accent-primary/20 border border-accent-primary/30 text-primary rounded-br-md'
                        : 'bg-surface-translucent border border-default text-primary rounded-bl-md'
                    }
                    after:absolute after:inset-0 after:rounded-2xl ${isOwn ? 'after:rounded-br-md' : 'after:rounded-bl-md'} after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)] after:pointer-events-none
                `}>

                    {/* Quoted Message */}
                    {msg.quotedMessage && (
                        <div
                            onClick={() => msg.quotedMessageId && onScrollToMessage(msg.quotedMessageId)}
                            className="mb-2.5 cursor-pointer rounded-xl px-3 py-2 text-xs border-l-4 transition-all hover:brightness-125 bg-inset border-default text-secondary"
                        >
                            <div className="flex items-center gap-1.5 mb-1">
                                <FaReply className="text-[8px] opacity-50" />
                                <span className="font-black text-[10px] uppercase tracking-wider">{msg.quotedName}</span>
                            </div>
                            <span className="line-clamp-2 italic opacity-80">{msg.quotedMessage}</span>
                        </div>
                    )}

                    {/* Message Text */}
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {showTranslation && translation ? (
                            <>
                                <span className="text-[9px] opacity-40 block mb-1 font-black uppercase tracking-widest">{t('messages.translated')}</span>
                                {translation}
                            </>
                        ) : (
                            msg.message
                        )}
                    </p>

                    {/* Action Buttons - Inside Bubble on Hover */}
                    <div className={`absolute ${isOwn ? 'left-0 -translate-x-full pl-2' : 'right-0 translate-x-full pr-2'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex gap-1`}>
                        {/* Bouton Réaction avec Picker */}
                        <div className="relative">
                            <button
                                onClick={() => setShowReactionPicker(!showReactionPicker)}
                                className="w-7 h-7 bg-inset hover:bg-accent-primary/30 border border-default backdrop-blur-lg rounded-lg text-secondary hover:text-primary text-[10px] flex items-center justify-center transition-all"
                                title="Réagir"
                            >
                                <FaSmile />
                            </button>

                            {/* Picker de réactions rapides */}
                            {showReactionPicker && (
                                <div className={`absolute ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} top-0 flex gap-1 p-2 bg-surface-translucent backdrop-blur-lg rounded-lg border border-default shadow-lg z-50`}>
                                    {QUICK_REACTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={async () => {
                                                console.log('[MessageItem] Emoji clicked', { emoji, messageId: msg.id });
                                                await reactionHook.toggleReaction(emoji);
                                                setShowReactionPicker(false);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-accent-primary/20 rounded-lg transition-all hover:scale-110"
                                            title={emoji}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => onTranslate(msg.id, msg.message)}
                            className="w-7 h-7 bg-inset hover:bg-surface-alt border border-default backdrop-blur-lg rounded-lg text-secondary hover:text-primary text-[10px] flex items-center justify-center transition-all"
                            title={t('messages.translate')}
                            disabled={isTranslating}
                        >
                            {isTranslating ? <FaSpinner className="animate-spin" /> : <FaLanguage />}
                        </button>
                        <button
                            onClick={() => onReply(msg)}
                            className="w-7 h-7 bg-inset hover:bg-accent-primary/30 border border-default backdrop-blur-lg rounded-lg text-secondary hover:text-primary text-[10px] flex items-center justify-center transition-all"
                            title={t('messages.reply')}
                        >
                            <FaReply />
                        </button>
                        {canDelete && (
                            <button
                                onClick={() => onDelete(msg.id)}
                                className="w-7 h-7 bg-accent-danger/20 hover:bg-accent-danger/40 border border-accent-danger/30 backdrop-blur-lg rounded-lg text-accent-danger text-[10px] flex items-center justify-center transition-all"
                                title={t('messages.delete')}
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                </div>

                {/* Reactions - Outside the bubble */}
                <MessageReactions
                    messageId={msg.id}
                    reactions={reactionHook.reactions}
                    onReactionClick={(emoji) => reactionHook.toggleReaction(emoji)}
                />
            </div>
        </motion.div>
    );
});

MessageItem.displayName = 'MessageItem';
