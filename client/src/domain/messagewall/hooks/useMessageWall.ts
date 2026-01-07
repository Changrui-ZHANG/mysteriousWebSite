/**
 * useMessageWall - Hook for message wall logic
 * Uses WebSocket for real-time updates (messages + presence).
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MESSAGE_CONSTANTS } from '../../../shared/constants/messages';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { getAdminCode } from '../../../shared/constants/authStorage';
import { postJson, deleteJson } from '../../../shared/api/httpClient';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
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

    // Handle WebSocket message events
    const handleWebSocketMessage = useCallback((event: { type: string; payload: unknown }) => {
        switch (event.type) {
            case 'NEW_MESSAGE':
                setMessages(prev => [...prev, event.payload as Message]);
                break;
            case 'DELETE_MESSAGE':
                setMessages(prev => prev.filter(m => m.id !== event.payload));
                break;
            case 'MUTE_STATUS':
                setIsGlobalMute(event.payload as boolean);
                break;
            case 'CLEAR_ALL':
                setMessages([]);
                break;
        }
    }, []);

    // Handle WebSocket presence updates
    const handlePresenceUpdate = useCallback((update: { count: number; showToAll: boolean }) => {
        setOnlineCount(update.count);
        setShowOnlineCountToAll(update.showToAll);
    }, []);

    // Fetch initial online count after WebSocket connects
    const fetchOnlineCount = useCallback(async () => {
        try {
            const response = await fetch(API_ENDPOINTS.PRESENCE.COUNT, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            const data = await response.json();
            if (data.data) {
                setOnlineCount(data.data.count);
                setShowOnlineCountToAll(data.data.showToAll);
            }
        } catch (error) {
            console.error('Failed to fetch online count:', error);
        }
    }, []);

    // Connect to WebSocket
    const { isConnected } = useWebSocket({
        onMessage: handleWebSocketMessage,
        onPresenceUpdate: handlePresenceUpdate,
        onConnect: () => {
            console.log('WebSocket connected');
            // Fetch count after connection is established
            fetchOnlineCount();
        },
        onDisconnect: () => console.log('WebSocket disconnected')
    });

    // Fetch Messages (initial load only)
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

    // Initial fetch only (no polling - WebSocket handles updates)
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

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

    // Submit message (via REST API - server broadcasts via WebSocket)
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
        } catch (error) {
            console.error('Failed to post message:', error);
        }
    }, [user, currentUserId, isAdmin, t, replyingTo]);

    // Delete message
    const handleDelete = useCallback(async (id: string) => {
        try {
            const userIdToCheck = user ? user.userId : currentUserId;
            const adminCode = isAdmin ? getAdminCode() : undefined;
            const url = adminCode
                ? `${API_ENDPOINTS.MESSAGES.DELETE(id)}?userId=${userIdToCheck}&adminCode=${adminCode}`
                : `${API_ENDPOINTS.MESSAGES.DELETE(id)}?userId=${userIdToCheck}`;
            await deleteJson(url);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }, [user, currentUserId, isAdmin]);

    // Admin actions
    const toggleMute = useCallback(async () => {
        const adminCode = getAdminCode();
        if (!adminCode) return;
        try {
            await postJson(`${API_ENDPOINTS.MESSAGES.TOGGLE_MUTE}?adminCode=${adminCode}`, {});
        } catch (error) {
            console.error('Failed to toggle mute:', error);
        }
    }, []);

    const clearAllMessages = useCallback(async () => {
        if (!confirm(t('admin.confirm_clear'))) return;
        const adminCode = getAdminCode();
        if (!adminCode) return;
        try {
            await postJson(`${API_ENDPOINTS.MESSAGES.CLEAR}?adminCode=${adminCode}`, {});
        } catch (error) {
            console.error('Failed to clear messages:', error);
        }
    }, [t]);

    const toggleOnlineCountVisibility = useCallback(async () => {
        const adminCode = getAdminCode();
        if (!adminCode) return;
        try {
            await postJson<{ showToAll: boolean }>(`${API_ENDPOINTS.PRESENCE.TOGGLE_VISIBILITY}?adminCode=${adminCode}`, {});
            // WebSocket will broadcast the update
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
        isWebSocketConnected: isConnected,
        handleTranslate, handleSubmit, handleDelete,
        toggleMute, clearAllMessages, toggleOnlineCountVisibility, fetchOnlineCount,
        isOwnMessage, canDeleteMessage, scrollToMessage
    };
}
