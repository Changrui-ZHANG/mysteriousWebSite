import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { STORAGE_KEYS } from '../../../shared/constants/config';
import { useConnectionState, ConnectionState } from '../../../shared/hooks/useConnectionState';
import { useChannelStore } from '../stores/channelStore';
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
 * Hook pour gérer les messages avec gestion d'erreur sans boucle
 * Utilise useConnectionState pour éviter les retry automatiques
 * Supporte le filtrage par channel
 */
export function useMessages({ user, isAdmin }: UseMessagesProps) {
    const { t } = useTranslation();
    const [allMessages, setAllMessages] = useState<Message[]>([]); // Tous les messages
    const [messages, setMessages] = useState<Message[]>([]); // Messages filtrés par channel
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [currentUserId, setCurrentUserId] = useState('');
    const [isGlobalMute, setIsGlobalMute] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Récupérer le channel actif depuis le store
    const activeChannelId = useChannelStore(state => state.activeChannelId);
    const incrementMessageCount = useChannelStore(state => state.incrementMessageCount);
    const updateLastMessageAt = useChannelStore(state => state.updateLastMessageAt);

    // Gestion de l'état de connexion pour éviter les boucles d'erreur
    const connectionState = useConnectionState(
        async () => {
            // Fonction de retry pour la connexion
            await fetchMessages();
        },
        3 // Maximum 3 tentatives
    );

    // Initialize User ID
    useEffect(() => {
        let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        }
        setCurrentUserId(userId);
    }, []);

    // Fetch Messages avec gestion d'erreur sans boucle - charge TOUS les messages UNE SEULE FOIS
    const fetchMessages = useCallback(async () => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            connectionState.setReconnecting();
            
            const response = await fetch(API_ENDPOINTS.MESSAGES.LIST);
            
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    // Debug: Log des messages reçus
                    console.log('[useMessages] Messages received from backend:', data);
                    data.forEach((msg, index) => {
                        if (msg.reactions && msg.reactions.length > 0) {
                            console.log(`[useMessages] Message ${index} has reactions:`, msg.reactions);
                        }
                    });
                    
                    // Stocker TOUS les messages
                    setAllMessages(data);
                }
                
                // Check mute status from header
                const muteHeader = response.headers.get('X-System-Muted');
                if (muteHeader !== null) {
                    setIsGlobalMute(muteHeader === 'true');
                }
                
                // Marquer comme connecté en cas de succès
                connectionState.setConnected();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : t('errors.messages.fetch_failed', 'Failed to load messages');
            
            // Marquer comme déconnecté SANS retry automatique
            connectionState.setDisconnected(errorMessage, true);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, connectionState, t]);

    // Initial fetch - UNE SEULE FOIS au démarrage
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMessages();
        }, 100);
        
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Filtrer les messages par channel actif (côté client, SANS refetch)
    useEffect(() => {
        if (activeChannelId && allMessages.length > 0) {
            const filteredMessages = allMessages.filter((msg: Message) => {
                const msgChannelId = msg.channelId || 'general';
                return msgChannelId === activeChannelId;
            });
            setMessages(filteredMessages);
        } else if (activeChannelId) {
            // Aucun message pour ce channel
            setMessages([]);
        }
    }, [activeChannelId, allMessages]);

    // Submit message avec gestion d'erreur et support des channels et images
    const handleSubmit = useCallback(async (messageText: string, tempName: string, imageUrl?: string) => {
        // Permettre l'envoi même en état RECONNECTING
        if (connectionState.connectionState === ConnectionState.ERROR) {
            connectionState.setDisconnected(
                t('errors.messages.not_connected', 'Not connected to server'), 
                true
            );
            return;
        }

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
                channelId: activeChannelId, // Ajouter le channel actif
                imageUrl: imageUrl || null, // Ajouter l'URL de l'image
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
                // Mettre à jour les métadonnées du channel
                incrementMessageCount(activeChannelId);
                updateLastMessageAt(activeChannelId, new Date());
                // Refresh messages après envoi réussi
                setTimeout(() => fetchMessages(), 100);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : t('errors.messages.send_failed', 'Failed to send message');
            
            connectionState.setDisconnected(errorMessage, true);
        }
    }, [user, currentUserId, isAdmin, t, replyingTo, fetchMessages, connectionState, activeChannelId, incrementMessageCount, updateLastMessageAt]);

    // Delete message avec gestion d'erreur
    const handleDelete = useCallback(async (id: string) => {
        // Permettre la suppression même en état RECONNECTING
        if (connectionState.connectionState === ConnectionState.ERROR) {
            connectionState.setDisconnected(
                t('errors.messages.not_connected', 'Not connected to server'), 
                true
            );
            return;
        }

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
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : t('errors.messages.delete_failed', 'Failed to delete message');
            
            connectionState.setDisconnected(errorMessage, true);
        }
    }, [user, currentUserId, connectionState, t]);

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

    // Mettre à jour les réactions d'un message
    const updateMessageReactions = useCallback((messageId: string, reactions: any[]) => {
        setAllMessages(prev => prev.map(msg => 
            msg.id === messageId 
                ? { ...msg, reactions }
                : msg
        ));
    }, []);

    // WebSocket event handlers (basic version) avec support des channels et réactions
    const handleWebSocketMessage = useCallback((event: { type: string; payload: unknown }) => {
        try {
            switch (event.type) {
                case 'NEW_MESSAGE': {
                    const newMessage = event.payload as Message;
                    // Ajouter le message à TOUS les messages
                    setAllMessages(prev => [...prev, newMessage]);
                    
                    // Mettre à jour les métadonnées du channel
                    const msgChannelId = newMessage.channelId || 'general';
                    incrementMessageCount(msgChannelId);
                    updateLastMessageAt(msgChannelId, new Date());
                    break;
                }
                case 'DELETE_MESSAGE':
                    setAllMessages(prev => prev.filter(m => m.id !== event.payload));
                    break;
                case 'MUTE_STATUS':
                    setIsGlobalMute(event.payload as boolean);
                    break;
                case 'CLEAR_ALL':
                    setAllMessages([]);
                    break;
                case 'REACTION_ADDED':
                case 'REACTION_REMOVED':
                case 'REACTION_UPDATED': {
                    // Mettre à jour les réactions d'un message
                    const { messageId, reactions } = event.payload as { messageId: string; reactions: any[] };
                    setAllMessages(prev => prev.map(msg => 
                        msg.id === messageId 
                            ? { ...msg, reactions }
                            : msg
                    ));
                    break;
                }
            }
        } catch (error) {
            console.error('WebSocket error:', error);
        }
    }, [incrementMessageCount, updateLastMessageAt]);

    return {
        // State
        messages,
        replyingTo,
        setReplyingTo,
        isGlobalMute,
        highlightedMessageId,
        currentUserId,
        isLoading,

        // Connection state - NOUVEAU
        connectionState: connectionState.connectionState,
        connectionError: connectionState.lastError,
        isRetrying: connectionState.isRetrying,
        canRetryConnection: connectionState.canRetry,
        retryConnection: connectionState.manualRetry,
        clearConnectionError: connectionState.clearError,

        // Actions
        handleSubmit,
        handleDelete,
        fetchMessages,

        // Helpers
        isOwnMessage,
        canDeleteMessage,
        scrollToMessage,
        updateMessageReactions,

        // WebSocket handler
        handleWebSocketMessage,

        // Admin actions (basic stubs)
        toggleMute: async () => console.log('Toggle mute not implemented'),
        clearAllMessages: async () => console.log('Clear all not implemented'),
    };
}