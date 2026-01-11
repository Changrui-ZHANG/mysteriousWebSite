/**
 * useMessageWall - Composed hook for message wall logic
 * Combines specialized hooks for better maintainability
 */

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

    // Connect to WebSocket with combined handlers
    const { isConnected } = useWebSocket({
        onMessage: messages.handleWebSocketMessage,
        onPresenceUpdate: presence.handlePresenceUpdate,
        onConnect: () => {
            console.log('WebSocket connected');
            // Fetch count after connection is established
            presence.fetchOnlineCount();
        },
        onDisconnect: () => console.log('WebSocket disconnected')
    });

    return {
        // Messages state and actions
        messages: messages.messages,
        replyingTo: messages.replyingTo,
        setReplyingTo: messages.setReplyingTo,
        isGlobalMute: messages.isGlobalMute,
        highlightedMessageId: messages.highlightedMessageId,
        handleSubmit: messages.handleSubmit,
        handleDelete: messages.handleDelete,
        toggleMute: messages.toggleMute,
        clearAllMessages: messages.clearAllMessages,
        isOwnMessage: messages.isOwnMessage,
        canDeleteMessage: messages.canDeleteMessage,
        scrollToMessage: messages.scrollToMessage,

        // Translation state and actions
        translations: translation.translations,
        translating: translation.translating,
        showTranslated: translation.showTranslated,
        handleTranslate: translation.handleTranslate,

        // Presence state and actions
        onlineCount: presence.onlineCount,
        showOnlineCountToAll: presence.showOnlineCountToAll,
        fetchOnlineCount: presence.fetchOnlineCount,
        toggleOnlineCountVisibility: presence.toggleOnlineCountVisibility,

        // WebSocket connection status
        isWebSocketConnected: isConnected,
    };
}
