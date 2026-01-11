import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { STORAGE_KEYS } from '../../../shared/constants/config';
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
 * Simplified version of useMessages hook to avoid runtime errors
 * Fallback to basic functionality while debugging
 */
export function useMessages({ user, isAdmin }: UseMessagesProps) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [currentUserId, setCurrentUserId] = useState('');
    const [isGlobalMute, setIsGlobalMute] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize User ID
    useEffect(() => {
        let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        }
        setCurrentUserId(userId);
    }, []);

    // Fetch Messages (basic version)
    const fetchMessages = useCallback(async () => {
        if (isLoading) return; // Prevent multiple calls
        
        try {
            setIsLoading(true);
            const response = await fetch(API_ENDPOINTS.MESSAGES.LIST);
            
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                }
                
                // Check mute status from header
                const muteHeader = response.headers.get('X-System-Muted');
                if (muteHeader !== null) {
                    setIsGlobalMute(muteHeader === 'true');
                }
            } else {
                console.error('Failed to fetch messages:', response.status);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    // Initial fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMessages();
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    // Submit message (basic version)
    const handleSubmit = useCallback(async (messageText: string, tempName: string) => {
        try {
            const senderId = user ? user.userId : currentUserId;
            let senderName = user ? user.username : tempName;
            if (!senderName) {
                senderName = isAdmin && !user ? t('admin.admin') : t('messages.anonymous');
            }

            const messagePayload = {
                userId: senderId,
                name: senderName,
                message: messageText,
                timestamp: Date.now(),
                isAnonymous: !senderName || senderName.trim() === '',
                quotedMessageId: replyingTo?.id || null,
            };

            const response = await fetch(API_ENDPOINTS.MESSAGES.ADD, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messagePayload),
            });

            if (response.ok) {
                setReplyingTo(null);
                // Optionally refresh messages
                setTimeout(() => fetchMessages(), 100);
            } else {
                console.error('Failed to send message:', response.status);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [user, currentUserId, isAdmin, t, replyingTo, fetchMessages]);

    // Delete message (basic version)
    const handleDelete = useCallback(async (id: string) => {
        try {
            const userIdToCheck = user ? user.userId : currentUserId;
            const url = `${API_ENDPOINTS.MESSAGES.DELETE(id)}?userId=${userIdToCheck}`;
            
            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove from local state
                setMessages(prev => prev.filter(m => m.id !== id));
            } else {
                console.error('Failed to delete message:', response.status);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    }, [user, currentUserId]);

    // Helpers
    const isOwnMessage = useCallback((message: Message) => {
        const myId = user ? user.userId : currentUserId;
        return message.userId === myId;
    }, [user, currentUserId]);

    const canDeleteMessage = useCallback(
        (message: Message) => isOwnMessage(message) || isAdmin, 
        [isOwnMessage, isAdmin]
    );

    const scrollToMessage = useCallback((messageId: string) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessageId(messageId);
            setTimeout(() => setHighlightedMessageId(null), 1000);
        }
    }, []);

    // WebSocket event handlers (basic version)
    const handleWebSocketMessage = useCallback((event: { type: string; payload: unknown }) => {
        try {
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
        } catch (error) {
            console.error('WebSocket error:', error);
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
        isLoading,

        // Actions
        handleSubmit,
        handleDelete,
        fetchMessages,

        // Helpers
        isOwnMessage,
        canDeleteMessage,
        scrollToMessage,

        // WebSocket handler
        handleWebSocketMessage,

        // Admin actions (basic stubs)
        toggleMute: async () => console.log('Toggle mute not implemented'),
        clearAllMessages: async () => console.log('Clear all not implemented'),
    };
}