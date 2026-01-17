package com.changrui.mysterious.domain.messagewall.controller;

import com.changrui.mysterious.domain.messagewall.dto.MessageResponse;
import com.changrui.mysterious.domain.messagewall.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for real-time message broadcasting.
 * Handles broadcasting events to all connected clients.
 */
@Controller
public class MessageWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;

    /**
     * Broadcast a new message to all subscribers.
     */
    public void broadcastNewMessage(MessageResponse message) {
        messagingTemplate.convertAndSend("/topic/messages",
                new WebSocketEvent("NEW_MESSAGE", message));
    }

    /**
     * Broadcast a message deletion event.
     */
    public void broadcastDelete(String messageId) {
        messagingTemplate.convertAndSend("/topic/messages",
                new WebSocketEvent("DELETE_MESSAGE", messageId));
    }

    /**
     * Broadcast mute status change.
     */
    public void broadcastMuteStatus(boolean isMuted) {
        messagingTemplate.convertAndSend("/topic/messages",
                new WebSocketEvent("MUTE_STATUS", isMuted));
    }

    /**
     * Broadcast clear all messages event.
     */
    public void broadcastClearAll() {
        messagingTemplate.convertAndSend("/topic/messages",
                new WebSocketEvent("CLEAR_ALL", null));
    }

    /**
     * Broadcast reaction update to all subscribers.
     */
    public void broadcastReactionUpdate(String messageId, Object reactions) {
        messagingTemplate.convertAndSend("/topic/messages",
                new WebSocketEvent("REACTION_UPDATED",
                        new ReactionUpdatePayload(messageId, reactions)));
    }

    /**
     * WebSocket event wrapper for type-safe messaging.
     */
    public record WebSocketEvent(String type, Object payload) {
    }

    /**
     * Payload for reaction updates.
     */
    public record ReactionUpdatePayload(String messageId, Object reactions) {
    }
}
