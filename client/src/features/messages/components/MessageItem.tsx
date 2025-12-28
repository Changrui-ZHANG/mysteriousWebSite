import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaLanguage, FaSpinner } from 'react-icons/fa';

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

interface MessageItemProps {
    msg: Message;
    index: number;
    isOwn: boolean;
    isDarkMode: boolean;
    isHighlighted: boolean;
    canDelete: boolean;
    translation?: string;
    isTranslating: boolean;
    showTranslation: boolean;
    onDelete: (id: string) => void;
    onReply: (msg: Message) => void;
    onTranslate: (id: string, text: string) => void;
    onScrollToMessage: (id: string) => void;
}

export function MessageItem({
    msg,
    index,
    isOwn,
    isDarkMode,
    isHighlighted,
    canDelete,
    translation,
    isTranslating,
    showTranslation,
    onDelete,
    onReply,
    onTranslate,
    onScrollToMessage
}: MessageItemProps) {
    const { t } = useTranslation();

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
            id={`message-${msg.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: isHighlighted ? 1.05 : 1,
                backgroundColor: isHighlighted
                    ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
                    : undefined
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.01 }}
            className={`flex gap-2 items-start p-2 rounded-lg transition-colors ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
        >
            <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${isOwn
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                : msg.isAnonymous
                    ? 'bg-gray-500 text-white'
                    : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                }`}>
                {getInitials(msg.name, msg.isAnonymous)}
            </div>

            <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
                <div className={`flex items-center gap-2 text-xs opacity-50 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="flex items-center gap-1">
                        {isOwn ? t('messages.you') : msg.name}
                        {msg.isVerified && <FaCheckCircle className={isDarkMode ? "text-cyan-400" : "text-blue-500"} />}
                    </span>
                    <span>·</span>
                    <span>{formatTimestamp(msg.timestamp)}</span>
                </div>

                <div className={`px-3 py-2 rounded-lg relative group ${isOwn
                    ? msg.isVerified
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-tr-sm border-2 border-cyan-400 shadow-lg shadow-cyan-500/30'
                        : 'bg-green-600 text-white rounded-tr-sm'
                    : msg.isVerified
                        ? isDarkMode
                            ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/20 rounded-tl-sm border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                            : 'bg-gradient-to-br from-blue-50 to-white rounded-tl-sm border-2 border-blue-400/60 shadow-lg shadow-blue-500/30'
                        : isDarkMode
                            ? 'bg-white/10 rounded-tl-sm'
                            : 'bg-white rounded-tl-sm shadow-sm'
                    }`}>

                    {msg.quotedMessage && (
                        <div
                            onClick={() => msg.quotedMessageId && onScrollToMessage(msg.quotedMessageId)}
                            className={`mb-2 pl-2 py-1 border-l-2 text-xs opacity-75 italic overflow-hidden cursor-pointer hover:opacity-100 transition-opacity ${isDarkMode ? 'border-white/30 bg-white/5' : 'border-black/20 bg-black/5'}`}
                        >
                            <span className="font-bold not-italic mr-1">{msg.quotedName}:</span>
                            <span className="line-clamp-2">{msg.quotedMessage}</span>
                        </div>
                    )}

                    <p className="text-base md:text-sm whitespace-pre-wrap break-words">
                        {showTranslation && translation ? (
                            <>
                                <span className="text-xs opacity-70 block mb-1 font-mono">{t('messages.translated')}:</span>
                                {translation}
                            </>
                        ) : (
                            msg.message
                        )}
                    </p>

                    {/* Action Buttons */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                            onClick={() => onTranslate(msg.id, msg.message)}
                            className="w-5 h-5 bg-black/20 hover:bg-black/40 rounded-full text-white text-xs flex items-center justify-center p-1"
                            title={t('messages.translate')}
                            aria-label={t('messages.translate')}
                            disabled={isTranslating}
                        >
                            {isTranslating ? <FaSpinner className="animate-spin" /> : <FaLanguage />}
                        </button>
                        {canDelete && (
                            <button
                                onClick={() => onDelete(msg.id)}
                                className="w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full text-white text-xs flex items-center justify-center"
                                aria-label={t('messages.delete')}
                            >
                                ×
                            </button>
                        )}
                        <button
                            onClick={() => onReply(msg)}
                            className="w-5 h-5 bg-purple-500 hover:bg-purple-400 rounded-full text-white text-xs flex items-center justify-center p-1"
                            title={t('messages.reply')}
                            aria-label={t('messages.reply')}
                        >
                            ↩
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
