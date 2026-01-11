/**
 * useMessageWall - Simplified composed hook for message wall logic
 * Reduces exposed API surface and focuses on essential functionality
 */

import { useMemo } from 'react';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import { useMessages } from './useMessages';
import { useMessageTranslation } from './useMessageTranslation';
import { useUserPresence } from './useUserPresence';

interface User { 
    userId: string; 
    username: string; 
}

interface UseMessageWallProps {
    user?: User | null;
    isAdmin: boolean;
}

export function useMessageWall({ user, isAdmin }: UseMessageWallProps) {
    // Use specialized hooks
    const messages = useMessages({ user, isAdmin });
    const translation = useMessageTranslation();
    const presence = useUserPresence();

    // Combine WebSocket handlers
    const webSocketHandlers = useMemo(() => ({
        onMessage: messages.handleWebSocketMessage,
        onPresenceUpdate: presence.handlePresenceUpdate,
        onConnect: () => {
            console.log('WebSocket connected');
            presence.fetchOnlineCount();
        },
        onDisconnect: () => console.log('WebSocket disconnected')
    }), [messages.handleWebSocketMessage, presence.handlePresenceUpdate, presence.fetchOnlineCount]);

    // Connect to WebSocket
    const { isConnected } = useWebSocket(webSocketHandlers);

    // Return simplified API focused on essential operations
    return {
        // Core message operations
        messages: messages.messages,
        isLoading: messages.isLoading,
        handleSubmit: messages.handleSubmit,
        handleDelete: messages.handleDelete,
        
        // Reply functionality
        replyingTo: messages.replyingTo,
        setReplyingTo: messages.setReplyingTo,
        scrollToMessage: messages.scrollToMessage,
        
        // Message permissions
        isOwnMessage: messages.isOwnMessage,
        canDeleteMessage: messages.canDeleteMessage,
        
        // Admin operations (only exposed if admin)
        ...(isAdmin && {
            isGlobalMute: messages.isGlobalMute,
            toggleMute: messages.toggleMute,
            clearAllMessages: messages.clearAllMessages,
        }),
        
        // Translation functionality
        translations: translation.translations,
        translating: translation.translating,
        handleTranslate: translation.handleTranslate,
        showTranslated: translation.showTranslated,
        
        // User presence
        onlineCount: presence.onlineCount,
        showOnlineCountToAll: presence.showOnlineCountToAll,
        toggleOnlineCountVisibility: presence.toggleOnlineCountVisibility,
        fetchOnlineCount: presence.fetchOnlineCount,
        
        // Connection status
        isWebSocketConnected: isConnected,
        
        // UI state
        highlightedMessageId: messages.highlightedMessageId,
    };
}
