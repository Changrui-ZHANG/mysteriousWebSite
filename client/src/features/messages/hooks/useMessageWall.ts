/**
 * useMessageWall - Hook for message wall logic
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MESSAGE_CONSTANTS } from '../../../constants/messages';
import { API_ENDPOINTS } from '../../../constants/endpoints';
import { getAdminCode } from '../../../constants/authStorage';
import { postJson, deleteJson } from '../../../api/httpClient';
import type { Message } from '../types';

interface User { userId: string; username: string; }

interface UseMessageWallProps {
    user?: User | null;
    isAdmin: boolean;
}

export function useMessageWall({ user, isAdmin }: UseMessageWallProps) {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [currentUserId, setCurrentUserId] = useState('');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [translating, setTranslating] = useState<Set<string>>(new Set());
    const [showTranslated, setShowTranslated] = useState<Set<string>>(new Set());
    const [isGlobalMute, setIsGlobalMute] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const [showOnlineCountToAll, setShowOnlineCountToAll] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

    // Initialize User ID
    useEffect(() => {
        let userId = localStorage.getItem(MESSAGE_CONSTANTS.STORAGE_KEY_USER_ID);
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            localStorage.setItem(MESSAGE_CONSTANTS.STORAGE_KEY_USER_ID, userId);
        }
        setCurrentUserId(userId);
    }, []);

    // Fetch Messages
    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch(API_ENDPOINTS.MESSAGES.LIST);
            const muteHeader = response.headers.get('X-System-Muted');
            if (muteHeader !== null) setIsGlobalMute(muteHeader === 'true');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, MESSAGE_CONSTANTS.POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    // Heartbeat for online presence
    useEffect(() => {
        const sendHeartbeat = async () => {
            const userId = user ? user.userId : currentUserId;
            if (userId) {
                try {
                    await fetch(API_ENDPOINTS.PRESENCE.HEARTBEAT, {
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
        const interval = setInterval(sendHeartbeat, MESSAGE_CONSTANTS.HEARTBEAT_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [currentUserId, user]);

    // Fetch online count
    const fetchOnlineCount = useCallback(async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PRESENCE.COUNT, {
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
        const interval = setInterval(fetchOnlineCount, MESSAGE_CONSTANTS.ONLINE_COUNT_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchOnlineCount]);

    // Translation handler
    const handleTranslate = useCallback(async (msgId: string, text: string) => {
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
                const finalText = translatedText.startsWith("MYMEMORY WARNING")
                    ? `⚠️ ${t('messages.translation_limit')}`
                    : translatedText;
                setTranslations(prev => ({ ...prev, [msgId]: finalText }));
                setShowTranslated(prev => new Set(prev).add(msgId));
            } else {
                setTranslations(prev => ({ ...prev, [msgId]: `⚠️ ${t('messages.translation_error')}` }));
                setShowTranslated(prev => new Set(prev).add(msgId));
            }
        } catch (error) {
            console.error("Failed to translate:", error);
        } finally {
            setTranslating(prev => { const newSet = new Set(prev); newSet.delete(msgId); return newSet; });
        }
    }, [translations, i18n.language, t]);

    // Submit message
    const handleSubmit = useCallback(async (messageText: string, tempName: string) => {
        const senderId = user ? user.userId : currentUserId;
        let senderName = user ? user.username : tempName;
        if (!senderName) senderName = isAdmin && !user ? t('admin.admin') : t('messages.anonymous');
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
            const adminCode = isAdmin ? getAdminCode() : undefined;
            const url = adminCode ? `${API_ENDPOINTS.MESSAGES.ADD}?adminCode=${adminCode}` : API_ENDPOINTS.MESSAGES.ADD;
            await postJson(url, message);
            setReplyingTo(null);
            fetchMessages();
        } catch (error) {
            console.error('Failed to post message:', error);
        }
    }, [user, currentUserId, isAdmin, t, replyingTo, fetchMessages]);

    // Delete message
    const handleDelete = useCallback(async (id: string) => {
        try {
            const userIdToCheck = user ? user.userId : currentUserId;
            const adminCode = isAdmin ? getAdminCode() : undefined;
            const url = adminCode
                ? `${API_ENDPOINTS.MESSAGES.DELETE(id)}?userId=${userIdToCheck}&adminCode=${adminCode}`
                : `${API_ENDPOINTS.MESSAGES.DELETE(id)}?userId=${userIdToCheck}`;
            await deleteJson(url);
            fetchMessages();
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }, [user, currentUserId, isAdmin, fetchMessages]);

    // Admin actions
    const toggleMute = useCallback(async () => {
        const adminCode = getAdminCode();
        if (!adminCode) return;
        try {
            await postJson(`${API_ENDPOINTS.MESSAGES.TOGGLE_MUTE}?adminCode=${adminCode}`, {});
            fetchMessages();
        } catch (error) {
            console.error('Failed to toggle mute:', error);
        }
    }, [fetchMessages]);

    const clearAllMessages = useCallback(async () => {
        if (!confirm(t('admin.confirm_clear'))) return;
        const adminCode = getAdminCode();
        if (!adminCode) return;
        try {
            await postJson(`${API_ENDPOINTS.MESSAGES.CLEAR}?adminCode=${adminCode}`, {});
            fetchMessages();
        } catch (error) {
            console.error('Failed to clear messages:', error);
        }
    }, [t, fetchMessages]);

    const toggleOnlineCountVisibility = useCallback(async () => {
        const adminCode = getAdminCode();
        if (!adminCode) return;
        try {
            const data = await postJson<{ showToAll: boolean }>(`${API_ENDPOINTS.PRESENCE.TOGGLE_VISIBILITY}?adminCode=${adminCode}`, {});
            setShowOnlineCountToAll(data.showToAll);
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        }
    }, []);

    // Helpers
    const isOwnMessage = useCallback((message: Message) => {
        const myId = user ? user.userId : currentUserId;
        return message.userId === myId;
    }, [user, currentUserId]);

    const canDeleteMessage = useCallback((message: Message) => isOwnMessage(message) || isAdmin, [isOwnMessage, isAdmin]);

    const scrollToMessage = useCallback((messageId: string) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessageId(messageId);
            setTimeout(() => setHighlightedMessageId(null), 1000);
        }
    }, []);

    return {
        messages, replyingTo, setReplyingTo, translations, translating, showTranslated,
        isGlobalMute, onlineCount, showOnlineCountToAll, highlightedMessageId,
        handleTranslate, handleSubmit, handleDelete,
        toggleMute, clearAllMessages, toggleOnlineCountVisibility, fetchOnlineCount,
        isOwnMessage, canDeleteMessage, scrollToMessage
    };
}
