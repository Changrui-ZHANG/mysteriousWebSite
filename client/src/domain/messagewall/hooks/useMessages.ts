import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { MESSAGE_CONSTANTS } from '../../../shared/constants/messages';
import { getAdminCode } from '../../../shared/constants/authStorage';
import { postJson, deleteJson } from '../../../shared/api/httpClient';
import type { Message } from '../types';

interface User { 
    userId: string; 
    username: string; 
}

interface UseMessagesProps {
    user?: User | null;
    isAdmin: boolean;
}

/**
 * Hook for managing messages state and operations
 * Handles CRUD operations for messages
 */
export function useMessages({ user, isAdmin }: UseMessagesProps) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [currentUserId, setCurrentUserId] = useState('');
    const [isGlobalMute, setIsGlobalMute] = useState(false);
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

    // Fetch Messages (initial load)
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

    // Initial fetch
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

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

    // WebSocket event handlers
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

    return {
        // State
        messages,
        replyingTo,
        setReplyingTo,
        isGlobalMute,
        highlightedMessageId,
        currentUserId,

        // Actions
        handleSubmit,
        handleDelete,
        toggleMute,
        clearAllMessages,
        fetchMessages,

        // Helpers
        isOwnMessage,
        canDeleteMessage,
        scrollToMessage,

        // WebSocket handler
        handleWebSocketMessage,
    };
}