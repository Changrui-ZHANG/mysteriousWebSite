import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaUser, FaSignOutAlt, FaTimes } from 'react-icons/fa';

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
}

const API_URL = '/api/messages';
const AUTH_URL = '/api/auth';

export function MessageWall({ isDarkMode }: MessageWallProps) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authUsername, setAuthUsername] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');

    const [adminCode, setAdminCode] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showNameInput, setShowNameInput] = useState(false);
    const [tempName, setTempName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGlobalMute, setIsGlobalMute] = useState(false);

    const ADMIN_CODE = 'Changrui';

    // Initialize User
    useEffect(() => {
        try {
            // Load stored user
            const storedUser = localStorage.getItem('messageWall_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user from local storage", e);
            localStorage.removeItem('messageWall_user');
        }

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

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');

        try {
            const endpoint = authMode === 'login' ? '/login' : '/register';
            const response = await fetch(`${AUTH_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: authUsername, password: authPassword })
            });

            const data = await response.json();

            if (response.ok) {
                if (authMode === 'login') {
                    const loggedInUser = { userId: data.userId, username: data.username };
                    setUser(loggedInUser);
                    localStorage.setItem('messageWall_user', JSON.stringify(loggedInUser));
                    setShowAuthModal(false);
                    setAuthUsername('');
                    setAuthPassword('');
                } else {
                    // Switch to login after register
                    setAuthMode('login');
                    setAuthSuccess(t('auth.success_register'));
                }
            } else {
                console.error('Auth error:', data);
                setAuthError(data.message || JSON.stringify(data) || t('auth.failed'));
            }
        } catch (error) {
            setAuthError('Network error');
        }
    };

    const handleLogout = () => {
        if (confirm(t('auth.confirm_logout'))) {
            setUser(null);
            localStorage.removeItem('messageWall_user');
        }
    };

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

    const verifyAdminCode = () => {
        if (adminCode === ADMIN_CODE) { setIsAdmin(true); setAdminCode(''); }
        else { alert('Invalid admin code'); }
    };

    const clearAllMessages = async () => {
        if (confirm('Delete all messages?')) {
            await fetch(`${API_URL}/clear?adminCode=${ADMIN_CODE}`, { method: 'POST' });
            fetchMessages();
        }
    };

    const isOwnMessage = (message: Message) => {
        const myId = user ? user.userId : currentUserId;
        return message.userId === myId || isAdmin;
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

    return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-2 md:px-4 py-20">
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
                                                    {msg.isVerified && <FaCheckCircle className="text-blue-400" />}
                                                </span>
                                                <span>·</span>
                                                <span>{formatTimestamp(msg.timestamp)}</span>
                                            </div>

                                            <div className={`px-3 py-2 rounded-lg relative group ${isOwn
                                                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-tr-sm'
                                                : isDarkMode ? 'bg-white/10 rounded-tl-sm' : 'bg-white rounded-tl-sm shadow-sm'
                                                }`}>
                                                <p className="text-base md:text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                                {isOwn && (
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
            <div className={`border-t ${isDarkMode ? 'bg-black/80 border-green-500/20' : 'bg-white/80 border-green-500/10'} backdrop-blur-lg`}>
                {isGlobalMute && !isAdmin && (
                    <div className="bg-red-500/10 text-red-500 text-xs text-center py-1">
                        {t('auth.muted')}
                    </div>
                )}
                <div className={`max-w-4xl mx-auto p-3 ${isGlobalMute && !isAdmin ? 'opacity-50' : ''}`}>
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        {/* Auth / Identity Button */}
                        {user ? (
                            <button type="button" onClick={handleLogout} className={`p-2 rounded-lg flex items-center gap-2 ring-1 transition-all ${isDarkMode ? 'bg-red-500/10 ring-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-red-50 ring-red-200 text-red-600 hover:bg-red-100'}`} title={t('auth.logout')}>
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <FaSignOutAlt className="w-4 h-4 opacity-70" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowAuthModal(true)}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                                title={t('auth.login')}
                            >
                                <FaUser className="w-5 h-5" />
                            </button>
                        )}

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
                                        className={`px-3 py-2 rounded-lg border-0 focus:outline-none text-base md:text-sm w-28 ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-gray-100 text-black placeholder-gray-500'}`}
                                    />
                                )}
                            </>
                        )}

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isGlobalMute && !isAdmin ? t('auth.muted') : t('messages.message_placeholder')}
                            maxLength={200}
                            disabled={isGlobalMute && !isAdmin}
                            className={`flex-1 px-4 py-2 rounded-lg border-0 focus:outline-none ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-gray-100 text-black placeholder-gray-500'} ${isGlobalMute && !isAdmin ? 'cursor-not-allowed' : ''}`}
                        />

                        <button type="submit" disabled={!newMessage.trim() || loading || (isGlobalMute && !isAdmin)} className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-30 rounded-lg text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>

                        <button type="button" onClick={() => setShowAdminPanel(!showAdminPanel)} className={`p-2 rounded-lg text-xs ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>🔐</button>
                    </form>

                    {/* Admin Panel */}
                    {showAdminPanel && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-2 pt-2 border-t border-green-500/10">
                            {!isAdmin ? (
                                <div className="flex gap-2">
                                    <input type="password" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder={t('auth.admin_code')} className={`flex-1 px-3 py-1.5 rounded-lg border-0 text-xs ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100'}`} />
                                    <button onClick={verifyAdminCode} className="px-3 py-1.5 bg-green-500 hover:bg-green-400 rounded-lg text-white text-xs font-bold">✓</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400 text-xs">✓ Admin</span>
                                    <button onClick={toggleMute} className={`px-3 py-1.5 rounded-lg text-white text-xs ${isGlobalMute ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                                        {isGlobalMute ? t('auth.unmute') : t('auth.mute')}
                                    </button>
                                    <button onClick={() => setIsAdmin(false)} className="px-3 py-1.5 bg-gray-500 rounded-lg text-white text-xs">{t('auth.quit_admin')}</button>
                                    <button onClick={clearAllMessages} className="ml-auto px-3 py-1.5 bg-red-500 rounded-lg text-white text-xs">{t('auth.clear_all')}</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowAuthModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-sm p-6 rounded-2xl shadow-xl ${isDarkMode ? 'bg-gray-900 border border-white/10' : 'bg-white'}`}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">{authMode === 'login' ? t('auth.login') : t('auth.register')}</h2>
                                <button onClick={() => setShowAuthModal(false)} className="opacity-50 hover:opacity-100"><FaTimes /></button>
                            </div>

                            <form onSubmit={handleAuth} className="flex flex-col gap-4">
                                {authError && <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded">{authError}</div>}
                                {authSuccess && <div className="text-green-500 text-sm bg-green-500/10 p-2 rounded">{authSuccess}</div>}

                                <input
                                    type="text"
                                    placeholder={t('auth.username')}
                                    value={authUsername}
                                    onChange={e => setAuthUsername(e.target.value)}
                                    className={`px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 ring-green-500 ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-100'}`}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder={t('auth.password')}
                                    value={authPassword}
                                    onChange={e => setAuthPassword(e.target.value)}
                                    className={`px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 ring-green-500 ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-100'}`}
                                    required
                                />

                                <button type="submit" className="bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-400 transition-colors">
                                    {authMode === 'login' ? t('auth.login') : t('auth.create_account')}
                                </button>
                            </form>

                            <div className="mt-4 text-center text-sm opacity-70">
                                {authMode === 'login' ? (
                                    <p>{t('auth.no_account')} <button onClick={() => setAuthMode('register')} className="text-green-500 font-bold hover:underline">{t('auth.register')}</button></p>
                                ) : (
                                    <p>{t('auth.has_account')} <button onClick={() => setAuthMode('login')} className="text-green-500 font-bold hover:underline">{t('auth.login')}</button></p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
