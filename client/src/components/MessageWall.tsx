import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    userId: string;
    name: string;
    message: string;
    timestamp: number;
    isAnonymous: boolean;
}

interface MessageWallProps {
    isDarkMode: boolean;
}

const API_URL = '/api/messages';

export function MessageWall({ isDarkMode }: MessageWallProps) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showNameInput, setShowNameInput] = useState(false);
    const [tempName, setTempName] = useState('');
    const [loading, setLoading] = useState(false);

    // Admin code
    const ADMIN_CODE = 'Changrui';

    // Generate or retrieve user ID
    useEffect(() => {
        let userId = localStorage.getItem('messageWall_userId');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('messageWall_userId', userId);
        }
        setCurrentUserId(userId);
    }, []);

    // Load messages from backend
    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || loading) return;

        setLoading(true);
        const message: Message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: currentUserId,
            name: tempName.trim() || t('messages.anonymous'),
            message: newMessage.trim(),
            timestamp: Date.now(),
            isAnonymous: !tempName.trim()
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages(); // Refresh messages
            }
        } catch (error) {
            console.error('Failed to post message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // If admin, send admin code to delete any message
            const url = isAdmin
                ? `${API_URL}/${id}?userId=${currentUserId}&adminCode=${ADMIN_CODE}`
                : `${API_URL}/${id}?userId=${currentUserId}`;

            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchMessages(); // Refresh messages
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const verifyAdminCode = () => {
        if (adminCode === ADMIN_CODE) {
            setIsAdmin(true);
            setAdminCode('');
        } else {
            alert('Code admin incorrect / Invalid admin code / 管理员代码错误');
        }
    };

    const clearAllMessages = async () => {
        if (confirm('Supprimer tous les messages ? / Delete all messages? / 删除所有留言？')) {
            try {
                const response = await fetch(`${API_URL}/clear?adminCode=${ADMIN_CODE}`, {
                    method: 'POST'
                });

                if (response.ok) {
                    setIsAdmin(false);
                    fetchMessages(); // Refresh messages
                }
            } catch (error) {
                console.error('Failed to clear messages:', error);
            }
        }
    };

    const isOwnMessage = (message: Message) => {
        return message.userId === currentUserId || isAdmin;
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        if (diff < 60000) return t('messages.just_now');
        if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    };

    const getInitials = (name: string, isAnon: boolean) => {
        if (isAnon) return '?';
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
            {/* Messages Area - Full Screen */}
            <div className="flex-1 overflow-y-auto px-2 md:px-4 py-20">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    <AnimatePresence>
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 opacity-40 text-sm"
                            >
                                {t('messages.empty')}
                            </motion.div>
                        ) : (
                            messages.map((msg, index) => {
                                const isOwn = isOwnMessage(msg);
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.01 }}
                                        className={`flex gap-2 items-start ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        {/* Avatar - Square */}
                                        <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${isOwn
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                                            : msg.isAnonymous
                                                ? 'bg-gray-500 text-white'
                                                : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                                            }`}>
                                            {getInitials(msg.name, msg.isAnonymous)}
                                        </div>

                                        {/* Message Bubble - Aligned on same line */}
                                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%]`}>
                                            {/* Name & Time */}
                                            <div className={`flex items-center gap-2 text-xs opacity-50 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <span>{isOwn ? t('messages.you') : msg.name}</span>
                                                <span>·</span>
                                                <span>{formatTimestamp(msg.timestamp)}</span>
                                            </div>

                                            {/* Message Content */}
                                            <div className={`px-3 py-2 rounded-lg relative group ${isOwn
                                                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-tr-sm'
                                                : isDarkMode
                                                    ? 'bg-white/10 rounded-tl-sm'
                                                    : 'bg-white rounded-tl-sm shadow-sm'
                                                }`}>
                                                <p className="text-base md:text-sm whitespace-pre-wrap break-words">
                                                    {msg.message}
                                                </p>

                                                {/* Delete button */}
                                                {isOwn && (
                                                    <button
                                                        onClick={() => handleDelete(msg.id)}
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Area - Fixed Bottom */}
            <div className={`border-t ${isDarkMode ? 'bg-black/80 border-green-500/20' : 'bg-white/80 border-green-500/10'} backdrop-blur-lg`}>
                <div className="max-w-4xl mx-auto p-3">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        {/* Name Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setShowNameInput(!showNameInput)}
                            className={`p-2 rounded-lg transition-colors ${showNameInput
                                ? 'bg-green-500 text-white'
                                : isDarkMode
                                    ? 'bg-white/10 hover:bg-white/20'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            title="Toggle name input"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>

                        {/* Name Input (Collapsible) */}
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
                                className={`px-3 py-2 rounded-lg border-0 focus:outline-none text-base md:text-sm w-28 ${isDarkMode
                                    ? 'bg-white/10 text-white placeholder-gray-400'
                                    : 'bg-gray-100 text-black placeholder-gray-500'
                                    }`}
                            />
                        )}

                        {/* Message Input */}
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('messages.message_placeholder')}
                            maxLength={200}
                            className={`flex-1 px-4 py-2 rounded-lg border-0 focus:outline-none ${isDarkMode
                                ? 'bg-white/10 text-white placeholder-gray-400'
                                : 'bg-gray-100 text-black placeholder-gray-500'
                                }`}
                        />

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || loading}
                            className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>

                        {/* Admin Button */}
                        <button
                            type="button"
                            onClick={() => setShowAdminPanel(!showAdminPanel)}
                            className={`p-2 rounded-lg transition-colors text-xs ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                                }`}
                        >
                            🔐
                        </button>
                    </form>

                    {/* Admin Panel (Collapsible) */}
                    {showAdminPanel && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2 pt-2 border-t border-green-500/10"
                        >
                            {!isAdmin ? (
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={adminCode}
                                        onChange={(e) => setAdminCode(e.target.value)}
                                        placeholder="Code admin"
                                        onKeyPress={(e) => e.key === 'Enter' && verifyAdminCode()}
                                        className={`flex-1 px-3 py-1.5 rounded-lg border-0 text-xs ${isDarkMode
                                            ? 'bg-white/10 text-white placeholder-gray-400'
                                            : 'bg-gray-100 text-black placeholder-gray-500'
                                            }`}
                                    />
                                    <button
                                        onClick={verifyAdminCode}
                                        className="px-3 py-1.5 bg-green-500 hover:bg-green-400 rounded-lg text-white text-xs font-bold"
                                    >
                                        ✓
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400 text-xs flex items-center gap-1">
                                        <span>✓</span>
                                        <span>Admin</span>
                                    </span>
                                    <button
                                        onClick={() => setIsAdmin(false)}
                                        className="px-3 py-1.5 bg-gray-500 hover:bg-gray-400 rounded-lg text-white text-xs font-bold"
                                    >
                                        ← Quitter
                                    </button>
                                    <button
                                        onClick={clearAllMessages}
                                        className="ml-auto px-3 py-1.5 bg-red-500 hover:bg-red-400 rounded-lg text-white text-xs font-bold"
                                    >
                                        🗑️ Clear All
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
