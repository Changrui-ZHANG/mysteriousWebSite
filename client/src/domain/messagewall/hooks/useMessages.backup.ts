import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageService } from '../services/MessageService';
import { STORAGE_KEYS, TIMING } from '../../../shared/constants/config';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import { useMessageState } from './useMessageState';
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
 * Hook for managing messages operations with improved state management
 * Uses useReducer for consolidated state and proper error handling
 * Includes protection against infinite loops
 */
export function useMessages({ user, isAdmin }: UseMessagesProps) {
    const { t } = useTranslation();
    const { handleError, withErrorHandling } = useErrorHandler();
    const { state, actions } = useMessageState();
    
    // Refs to prevent multiple simultaneous calls
    const fetchingRef = useRef(false);
    const lastFetchTimeRef = useRef(0);
    const retryCountRef = useRef(0);
    
    // Get current user ID from localStorage
    const getCurrentUserId = useCallback(() => {
        let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        }
        return userId;
    }, []);

    // Service instance
    const messageService = new MessageService();

    // Fetch Messages with error handling and retry protection
    const fetchMessages = useCallback(async () => {
        // Prevent multiple simultaneous calls
        if (fetchingRef.current) {
            console.log('Fetch already in progress, skipping...');
            return;
        }

        // Prevent too frequent calls (minimum 1 second between calls)
        const now = Date.now();
        if (now - lastFetchTimeRef.current < 1000) {
            console.log('Too frequent fetch attempt, skipping...');
            return;
        }

        // Limit retry attempts
        if (retryCountRef.current >= 3) {
            console.log('Max retry attempts reached, stopping...');
            return;
        }

        fetchingRef.current = true;
        lastFetchTimeRef.current = now;
        
        try {
            actions.setLoading(true);
            
            const data = await messageService.getMessages();
            const muteStatus = await messageService.getGlobalMuteStatus();
            
            actions.setMessages(Array.isArray(data) ? data : []);
            actions.setGlobalMute(muteStatus);
            
            // Reset retry count on success
            retryCountRef.current = 0;
            
        } catch (error) {
            retryCountRef.current++;
            handleError(error, 'fetchMessages', {
                customMessage: t('errors.failed_to_load_messages'),
                showToUser: retryCountRef.current >= 3, // Only show error after 3 attempts
            });
        } finally {
            actions.setLoading(false);
            fetchingRef.current = false;
        }
    }, [messageService, actions, handleError, t]);

    // Initial fetch with delay to prevent immediate retry loops
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMessages();
        }, 100); // Small delay to prevent immediate execution

        return () => clearTimeout(timer);
    }, []); // Only run once on mount

    // Submit message with validation and error handling
    const handleSubmit = useCallback(async (messageText: string, tempName: string) => {
        const operation = withErrorHandling(async () => {
            const senderId = user ? user.userId : getCurrentUserId();
            let senderName = user ? user.username : tempName;
            if (!senderName) {
                senderName = isAdmin && !user ? t('admin.admin') : t('messages.anonymous');
            }

            const messageData = {
                content: messageText,
                userId: senderId,
                username: senderName,
                replyToId: state.replyingTo?.id,
            };

            await messageService.submitMessage(messageData, isAdmin);
            actions.setReplyingTo(null);
        }, 'submitMessage', {
            customMessage: t('errors.failed_to_send_message'),
        });

        await operation();
    }, [messageService, user, getCurrentUserId, isAdmin, t, state.replyingTo, actions, withErrorHandling]);

    // Delete message with error handling
    const handleDelete = useCallback(async (id: string) => {
        const operation = withErrorHandling(async () => {
            const userIdToCheck = user ? user.userId : getCurrentUserId();
            await messageService.deleteMessage(id, userIdToCheck, isAdmin);
        }, 'deleteMessage', {
            customMessage: t('errors.failed_to_delete_message'),
        });

        await operation();
    }, [messageService, user, getCurrentUserId, isAdmin, t, withErrorHandling]);

    // Admin actions with error handling
    const toggleMute = useCallback(async () => {
        const operation = withErrorHandling(async () => {
            const newMuteStatus = !state.isGlobalMute;
            await messageService.toggleGlobalMute(newMuteStatus);
            actions.setGlobalMute(newMuteStatus);
        }, 'toggleMute', {
            customMessage: t('errors.failed_to_toggle_mute'),
        });

        await operation();
    }, [messageService, state.isGlobalMute, actions, t, withErrorHandling]);

    const clearAllMessages = useCallback(async () => {
        if (!confirm(t('admin.confirm_clear'))) return;
        
        const operation = withErrorHandling(async () => {
            await messageService.clearAllMessages();
            actions.clearMessages();
        }, 'clearAllMessages', {
            customMessage: t('errors.failed_to_clear_messages'),
        });

        await operation();
    }, [messageService, actions, t, withErrorHandling]);

    // Helpers
    const isOwnMessage = useCallback((message: Message) => {
        const myId = user ? user.userId : getCurrentUserId();
        return message.userId === myId;
    }, [user, getCurrentUserId]);

    const canDeleteMessage = useCallback(
        (message: Message) => isOwnMessage(message) || isAdmin, 
        [isOwnMessage, isAdmin]
    );

    const scrollToMessage = useCallback((messageId: string) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            actions.setHighlightedMessage(messageId);
            setTimeout(() => actions.setHighlightedMessage(null), TIMING.MESSAGE_HIGHLIGHT_DURATION);
        }
    }, [actions]);

    // WebSocket event handlers
    const handleWebSocketMessage = useCallback((event: { type: string; payload: unknown }) => {
        try {
            switch (event.type) {
                case 'NEW_MESSAGE':
                    actions.addMessage(event.payload as Message);
                    break;
                case 'DELETE_MESSAGE':
                    actions.deleteMessage(event.payload as string);
                    break;
                case 'MUTE_STATUS':
                    actions.setGlobalMute(event.payload as boolean);
                    break;
                case 'CLEAR_ALL':
                    actions.clearMessages();
                    break;
                default:
                    console.warn('Unknown WebSocket event type:', event.type);
            }
        } catch (error) {
            handleError(error, 'WebSocket message handling', {
                showToUser: false, // Don't show WebSocket errors to users
            });
        }
    }, [actions, handleError]);

    return {
        // State
        messages: state.messages,
        replyingTo: state.replyingTo,
        setReplyingTo: actions.setReplyingTo,
        isGlobalMute: state.isGlobalMute,
        highlightedMessageId: state.highlightedMessageId,
        currentUserId: getCurrentUserId(),
        isLoading: state.isLoading,

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