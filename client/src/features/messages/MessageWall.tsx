import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import UserManagement from '../admin/UserManagement';
import { ScrollProgress } from '../../components';
import { MessageItem, MessageInput, MessageAdminPanel } from './components';
import type { Message, MessageWallProps } from './types';

const API_URL = '/api/messages';
const ADMIN_CODE = 'Changrui';
const SUPER_ADMIN_CODE = 'ChangruiZ';

export function MessageWall({ isDarkMode, user, onOpenLogin, isAdmin = false, isSuperAdmin = false }: MessageWallProps) {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [currentUserId, setCurrentUserId] = useState('');

    // Translation State
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [translating, setTranslating] = useState<Set<string>>(new Set());
    const [showTranslated, setShowTranslated] = useState<Set<string>>(new Set());

    // Admin State
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [isGlobalMute, setIsGlobalMute] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const [showOnlineCountToAll, setShowOnlineCountToAll] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    const [showUserManagement, setShowUserManagement] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initialize User ID
    useEffect(() => {
        let userId = localStorage.getItem('messageWall_userId');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            localStorage.setItem('messageWall_userId', userId);
        }
        setCurrentUserId(userId);
    }, []);

    // Fetch Messages
    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch(API_URL);
            const muteHeader = response.headers.get('X-System-Muted');
            if (muteHeader !== null) {
                setIsGlobalMute(muteHeader === 'true');
            }
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    // Heartbeat for online presence
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
        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 10000);
        return () => clearInterval(interval);
    }, [currentUserId, user]);

    // Fetch online count
    const fetchOnlineCount = useCallback(async () => {
        try {
            const response = await fetch('/api/presence/count', {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            const data = await response.json();
            setOnlineCount(data.count);
            setShowOnlineCountToAll(data.showToAll);
        } catch (error) {
            console.error('Failed to fetch online count:', error);
        }
    }, []);

    useEffect(() => {
        fetchOnlineCount();
        const interval = setInterval(fetchOnlineCount, 5000);
        return () => clearInterval(interval);
    }, [fetchOnlineCount]);

    // Translation handler
    const handleTranslate = async (msgId: string, text: string) => {
        if (translations[msgId]) {
            setShowTranslated(prev => {
                const newSet = new Set(prev);
                if (newSet.has(msgId)) newSet.delete(msgId);
                else newSet.add(msgId);
                return newSet;
            });
            return;
        }

        setTranslating(prev => new Set(prev).add(msgId));
        try {
            const targetLang = i18n.language === 'zh' ? 'zh-CN' : i18n.language;
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${targetLang}`);
            const data = await response.json();

            if (data.responseStatus === 200 && data.responseData?.translatedText) {
                const translatedText = data.responseData.translatedText;
                if (translatedText.startsWith("MYMEMORY WARNING")) {
                    setTranslations(prev => ({ ...prev, [msgId]: `⚠️ ${t('messages.translation_limit')}` }));
                } else {
                    setTranslations(prev => ({ ...prev, [msgId]: translatedText }));
                }
                setShowTranslated(prev => new Set(prev).add(msgId));
            } else {
                setTranslations(prev => ({ ...prev, [msgId]: `⚠️ ${t('messages.translation_error')}` }));
                setShowTranslated(prev => new Set(prev).add(msgId));
            }
        } catch (error) {
            console.error("Failed to translate:", error);
        } finally {
            setTranslating(prev => {
                const newSet = new Set(prev);
                newSet.delete(msgId);
                return newSet;
            });
        }
    };

    // Submit message
    const handleSubmit = async (messageText: string, tempName: string) => {
        const senderId = user ? user.userId : currentUserId;
        let senderName = user ? user.username : tempName;
        if (!senderName) {
            senderName = isAdmin && !user ? t('admin.admin') : t('messages.anonymous');
        }
        const isAnon = user ? false : (!tempName && !isAdmin);

        const message: Partial<Message> = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
            userId: senderId,
            name: senderName,
            message: messageText,
            timestamp: Date.now(),
            isAnonymous: isAnon,
            quotedMessageId: replyingTo?.id
        };

        try {
            const endpoint = isAdmin ? `${API_URL}?adminCode=${ADMIN_CODE}` : API_URL;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            if (response.ok) {
                setReplyingTo(null);
                fetchMessages();
            }
        } catch (error) {
            console.error('Failed to post message:', error);
        }
    };

    // Delete message
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

    // Admin actions
    const toggleMute = async () => {
        try {
            const response = await fetch(`${API_URL}/toggle-mute?adminCode=${ADMIN_CODE}`, { method: 'POST' });
            if (response.ok) fetchMessages();
        } catch (e) {
            console.error(e);
        }
    };

    const clearAllMessages = async () => {
        if (confirm(t('admin.confirm_clear'))) {
            await fetch(`${API_URL}/clear?adminCode=${ADMIN_CODE}`, { method: 'POST' });
            fetchMessages();
        }
    };

    const toggleOnlineCountVisibility = async () => {
        try {
            const response = await fetch(`/api/presence/toggle-visibility?adminCode=${ADMIN_CODE}`, { method: 'POST' });
            const data = await response.json();
            setShowOnlineCountToAll(data.showToAll);
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        }
    };

    // Helpers
    const isOwnMessage = (message: Message) => {
        const myId = user ? user.userId : currentUserId;
        return message.userId === myId;
    };

    const canDeleteMessage = (message: Message) => isOwnMessage(message) || isAdmin;

    const scrollToMessage = (messageId: string) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessageId(messageId);
            setTimeout(() => setHighlightedMessageId(null), 1000);
        }
    };

    return (
        <div className={`fixed inset-0 overflow-hidden flex flex-col pt-24 overscroll-none ${isDarkMode ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
            <ScrollProgress isDarkMode={isDarkMode} target={scrollContainerRef} />

            {/* Online Count Indicator */}
            {(showOnlineCountToAll || isAdmin) && (
                <div className="fixed top-24 right-4 z-40 transition-opacity duration-300 pointer-events-none">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-2 pointer-events-auto ${isDarkMode ? 'bg-white/10 text-cyan-300 backdrop-blur-md border border-white/5' : 'bg-white text-blue-600 shadow-md'}`}>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        {onlineCount} {t('messages.online')}
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
                            messages.map((msg, index) => (
                                <MessageItem
                                    key={msg.id}
                                    msg={msg}
                                    index={index}
                                    isOwn={isOwnMessage(msg)}
                                    isDarkMode={isDarkMode}
                                    isHighlighted={highlightedMessageId === msg.id}
                                    canDelete={canDeleteMessage(msg)}
                                    translation={translations[msg.id]}
                                    isTranslating={translating.has(msg.id)}
                                    showTranslation={showTranslated.has(msg.id)}
                                    onDelete={handleDelete}
                                    onReply={setReplyingTo}
                                    onTranslate={handleTranslate}
                                    onScrollToMessage={scrollToMessage}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Area */}
            <MessageInput
                isDarkMode={isDarkMode}
                user={user ?? null}
                isAdmin={isAdmin}
                isGlobalMute={isGlobalMute}
                replyingTo={replyingTo}
                onSubmit={handleSubmit}
                onCancelReply={() => setReplyingTo(null)}
                onOpenLogin={onOpenLogin ?? (() => {})}
                onOpenAdminPanel={() => setShowAdminPanel(!showAdminPanel)}
            />

            {/* Admin Panel */}
            {showAdminPanel && (
                <div className={`border-t ${isDarkMode ? 'bg-black/80 border-green-500/20' : 'bg-white/80 border-green-500/10'} backdrop-blur-lg`}>
                    <div className="max-w-4xl mx-auto p-3">
                        <MessageAdminPanel
                            isDarkMode={isDarkMode}
                            isAdmin={isAdmin}
                            isSuperAdmin={isSuperAdmin}
                            isGlobalMute={isGlobalMute}
                            onlineCount={onlineCount}
                            showOnlineCountToAll={showOnlineCountToAll}
                            onToggleMute={toggleMute}
                            onClearAll={clearAllMessages}
                            onToggleOnlineVisibility={toggleOnlineCountVisibility}
                            onRefreshOnlineCount={fetchOnlineCount}
                            onOpenUserManagement={() => setShowUserManagement(true)}
                        />
                    </div>
                </div>
            )}

            <UserManagement
                isOpen={showUserManagement}
                onClose={() => setShowUserManagement(false)}
                superAdminCode={SUPER_ADMIN_CODE}
                isDarkMode={isDarkMode}
            />
        </div>
    );
}
