import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import UserManagement from '../admin/UserManagement';
import { ScrollProgress } from '../../components/ScrollProgress';

interface Message {
    id: string;
    userId: string;
    name: string;
    message: string;
    timestamp: number;
    isAnonymous: boolean;
    isVerified: boolean;
}

interface User {
    userId: string;
    username: string;
}

interface MessageWallProps {
    isDarkMode: boolean;
    user?: User | null;
    onOpenLogin?: () => void;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
}

const API_URL = '/api/messages';
// Removed AUTH_URL since we don't auth here anymore

export function MessageWall({ isDarkMode, user, onOpenLogin, isAdmin = false, isSuperAdmin = false }: MessageWallProps) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    // Removed local Auth State (authMode, authUsername, authPassword, etc.)

    // const [adminCode, setAdminCode] = useState(''); // Moved to App/Navbar
    // const [isAdmin, setIsAdmin] = useState(false); // Via props
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showNameInput, setShowNameInput] = useState(false);
    const [tempName, setTempName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGlobalMute, setIsGlobalMute] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const [showOnlineCountToAll, setShowOnlineCountToAll] = useState(false);

    const ADMIN_CODE = 'Changrui'; // Kept for API calls
    const SUPER_ADMIN_CODE = 'ChangruiZ'; // Kept for API calls

    const [showUserManagement, setShowUserManagement] = useState(false);

    // Initialize User
    useEffect(() => {
        // Removed local storage user loading - relies on prop

        // Load or create device ID (for anonymous users)
        let userId = localStorage.getItem('messageWall_userId');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('messageWall_userId', userId);
        }
        setCurrentUserId(userId);
    }, []);

    // Load messages
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, []);

    // Send heartbeat to track online presence
    useEffect(() => {
        const sendHeartbeat = async () => {
            const userId = user ? user.userId : currentUserId;
            if (userId) {
                try {
                    await fetch('/api/presence/heartbeat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId })
                    });
                } catch (error) {
                    console.error('Failed to send heartbeat:', error);
                }
            }
        };

        sendHeartbeat(); // Send immediately
        const interval = setInterval(sendHeartbeat, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, [currentUserId, user]);

    // Fetch online count
    const fetchOnlineCount = async () => {
        try {
            const response = await fetch('/api/presence/count', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            const data = await response.json();
            setOnlineCount(data.count);
            setShowOnlineCountToAll(data.showToAll);
        } catch (error) {
            console.error('Failed to fetch online count:', error);
        }
    };

    // Fetch online count
    useEffect(() => {
        fetchOnlineCount();
        const interval = setInterval(fetchOnlineCount, 5000); // Every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch(API_URL);

            // Check mute header
            const muteHeader = response.headers.get('X-System-Muted');
            if (muteHeader !== null) {
                setIsGlobalMute(muteHeader === 'true');
            }

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    console.error("Fetched data is not an array:", data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const toggleMute = async () => {
        try {
            const response = await fetch(`${API_URL}/toggle-mute?adminCode=${ADMIN_CODE}`, {
                method: 'POST'
            });
            if (response.ok) {
                fetchMessages();
            } else {
                alert('Mute toggle failed');
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Removed handleAuth and handleLogout

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || loading) return;

        setLoading(true);

        // Determine sender details
        const senderId = user ? user.userId : currentUserId;
        const senderName = user ? user.username : (tempName.trim() || t('messages.anonymous'));
        const isAnon = user ? false : !tempName.trim();

        const message: Partial<Message> = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: senderId,
            name: senderName,
            message: newMessage.trim(),
            timestamp: Date.now(),
            isAnonymous: isAnon
            // isVerified is set by backend based on userId
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Failed to post message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const userIdToCheck = user ? user.userId : currentUserId;
            const url = isAdmin
                ? `${API_URL}/${id}?userId=${userIdToCheck}&adminCode=${ADMIN_CODE}`
                : `${API_URL}/${id}?userId=${userIdToCheck}`;

            const response = await fetch(url, { method: 'DELETE' });
            if (response.ok) fetchMessages();
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    // Admin & Helper Functions

    // Removed verifyAdminCode and logoutAdmin (handled globally now)

    const clearAllMessages = async () => {
        if (confirm(t('admin.confirm_clear') || 'Delete all messages?')) {
            await fetch(`${API_URL}/clear?adminCode=${ADMIN_CODE}`, { method: 'POST' });
            fetchMessages();
        }
    };

    const toggleOnlineCountVisibility = async () => {
        try {
            const response = await fetch(`/api/presence/toggle-visibility?adminCode=${ADMIN_CODE}`, {
                method: 'POST'
            });
            const data = await response.json();
            setShowOnlineCountToAll(data.showToAll);
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        }
    };

    const isOwnMessage = (message: Message) => {
        const myId = user ? user.userId : currentUserId;
        return message.userId === myId;
    };

    const canDeleteMessage = (message: Message) => {
        return isOwnMessage(message) || isAdmin;
    };

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

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className={`fixed inset-0 overflow-hidden flex flex-col pt-24 overscroll-none ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
            <ScrollProgress isDarkMode={isDarkMode} target={scrollContainerRef} />
            {/* Online Count Indicator */}
            {(showOnlineCountToAll || isAdmin) && (
                <div className="fixed top-24 right-4 z-40 transition-opacity duration-300 pointer-events-none">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-2 pointer-events-auto ${isDarkMode ? 'bg-white/10 text-cyan-300 backdrop-blur-md border border-white/5' : 'bg-white text-blue-600 shadow-md'
                        }`}>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {onlineCount} online
                    </span>
                </div>
            )}

            {/* Messages Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-2 md:px-4 pb-20">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    <AnimatePresence>
                        {(!Array.isArray(messages) || messages.length === 0) ? (
                            <div className="text-center py-20 opacity-40 text-sm">{t('messages.empty')}</div>
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
                                        <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${isOwn
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                                            : msg.isAnonymous
                                                ? 'bg-gray-500 text-white'
                                                : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                                            }`}>
                                            {getInitials(msg.name, msg.isAnonymous)}
                                        </div>

                                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%]`}>
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
                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-tr-sm border-2 border-emerald-300/50 shadow-lg shadow-green-500/20'
                                                    : 'bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-tr-sm'
                                                : msg.isVerified
                                                    ? isDarkMode
                                                        ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/20 rounded-tl-sm border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                                                        : 'bg-gradient-to-br from-blue-50 to-white rounded-tl-sm border-2 border-blue-400/60 shadow-lg shadow-blue-500/30'
                                                    : isDarkMode
                                                        ? 'bg-white/10 rounded-tl-sm'
                                                        : 'bg-white rounded-tl-sm shadow-sm'
                                                }`}>
                                                <p className="text-base md:text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                                {canDeleteMessage(msg) && (
                                                    <button onClick={() => handleDelete(msg.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
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

            {/* Input Area */}
            <div className={`border-t pb-[env(safe-area-inset-bottom)] ${isDarkMode ? 'bg-black/80 border-green-500/20' : 'bg-white/80 border-green-500/10'} backdrop-blur-lg`}>
                {isGlobalMute && !isAdmin && (
                    <div className="bg-red-500/10 text-red-500 text-xs text-center py-1">
                        {t('auth.muted')}
                    </div>
                )}
                <div className={`max-w-4xl mx-auto p-3 ${isGlobalMute && !isAdmin ? 'opacity-50' : ''}`}>
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
                        {/* Auth / Identity Display */}
                        {user ? (
                            <div className={`p-2 rounded-lg flex items-center gap-2 ring-1 transition-all ${isDarkMode ? 'bg-green-500/10 ring-green-500/30 text-green-500' : 'bg-green-50 ring-green-200 text-green-600'}`}>
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        ) : null}

                        {/* Manual Name Input (Only if not logged in) */}
                        {!user && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowNameInput(!showNameInput)}
                                    disabled={isGlobalMute && !isAdmin}
                                    className={`p-2 rounded-lg transition-colors ${showNameInput ? 'bg-green-500 text-white' : isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
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
                                        disabled={isGlobalMute && !isAdmin}
                                        className={`px-3 py-2 rounded-lg border-0 focus:outline-none text-base md:text-sm w-20 md:w-28 ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-gray-100 text-black placeholder-gray-500'}`}
                                    />
                                )}
                            </>
                        )}

                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={
                                    isGlobalMute && !isAdmin
                                        ? t('auth.muted')
                                        : !user
                                            ? ''
                                            : t('messages.message_placeholder')
                                }
                                maxLength={200}
                                disabled={isGlobalMute && !isAdmin}
                                className={`w-full px-4 py-2 rounded-lg border-0 focus:outline-none ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-gray-100 text-black placeholder-gray-500'} ${isGlobalMute && !isAdmin ? 'cursor-not-allowed' : ''}`}
                            />

                            {/* Interactive Placeholder Overlay */}
                            {!user && !newMessage && !(isGlobalMute && !isAdmin) && (
                                <div className={`absolute inset-0 px-4 py-2 pointer-events-none flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <span>{t('messages.guest_placeholder_text')}</span>
                                    <button
                                        type="button"
                                        onClick={() => onOpenLogin && onOpenLogin()}
                                        className="pointer-events-auto hover:underline font-bold text-green-500 ml-1 focus:outline-none"
                                    >
                                        {t('messages.guest_placeholder_link')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={!newMessage.trim() || loading || (isGlobalMute && !isAdmin)} className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-30 rounded-lg text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>

                        {isAdmin && (
                            <button type="button" onClick={() => setShowAdminPanel(!showAdminPanel)} className={`p-2 rounded-lg text-xs ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>🔐</button>
                        )}
                    </form>

                    {/* Admin Panel */}
                    {(showAdminPanel) && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-2 pt-2 border-t border-green-500/10">
                            {!isAdmin ? (
                                <div className="text-xs text-gray-500 text-center py-2">
                                    {t('admin.login_hint') || 'Use the padlock in the top navbar to log in as admin.'}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold ${isSuperAdmin ? 'text-purple-400' : 'text-green-400'}`}>
                                        ✓ {isSuperAdmin ? 'Super Admin' : 'Admin'}
                                    </span>

                                    <div className="w-[1px] h-4 bg-gray-500/30 mx-1"></div>

                                    <div className="flex items-center gap-1">
                                        <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                            👥 {onlineCount}
                                        </span>
                                        <button
                                            onClick={fetchOnlineCount}
                                            className={`px-2 py-1.5 rounded-lg text-white text-xs ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-500 hover:bg-gray-600'}`}
                                            title="Refresh count"
                                        >
                                            🔄
                                        </button>
                                        {isSuperAdmin && (
                                            <>
                                                <div className="w-[1px] h-4 bg-gray-500/30 mx-1"></div>
                                                <button
                                                    onClick={() => setShowUserManagement(true)}
                                                    className="px-2 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs"
                                                >
                                                    {t('admin.manage_users')}
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={toggleOnlineCountVisibility}
                                            className={`px-3 py-1.5 rounded-lg text-white text-xs ${showOnlineCountToAll ? 'bg-blue-500' : 'bg-gray-600'}`}
                                            title={showOnlineCountToAll ? "Hide count from users" : "Show count to users"}
                                        >
                                            {showOnlineCountToAll ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>

                                    <div className="w-[1px] h-4 bg-gray-500/30 mx-1"></div>

                                    <button onClick={toggleMute} className={`px-3 py-1.5 rounded-lg text-white text-xs ${isGlobalMute ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                                        {isGlobalMute ? t('auth.unmute') : t('auth.mute')}
                                    </button>

                                    <div className="w-[1px] h-4 bg-gray-500/30 mx-1"></div>

                                    <button onClick={clearAllMessages} className="ml-auto px-3 py-1.5 bg-red-500 rounded-lg text-white text-xs">{t('auth.clear_all')}</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <UserManagement
                isOpen={showUserManagement}
                onClose={() => setShowUserManagement(false)}
                superAdminCode={SUPER_ADMIN_CODE}
                isDarkMode={isDarkMode}
            />
        </div>
    );
}

