package com.changrui.mysterious.domain.onlinecount.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Service for tracking online presence via WebSocket connections.
 * No database needed - uses in-memory tracking of active sessions.
 */
@Service
public class WebSocketPresenceService {

    private final Set<String> activeSessions = ConcurrentHashMap.newKeySet();
    private final AtomicBoolean showOnlineCountToAll = new AtomicBoolean(false);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Called when a WebSocket session connects.
     */
    public void userConnected(String sessionId) {
        if (sessionId != null) {
            activeSessions.add(sessionId);
            broadcastOnlineCount();
        }
    }

    /**
     * Called when a WebSocket session disconnects.
     */
    public void userDisconnected(String sessionId) {
        if (sessionId != null) {
            activeSessions.remove(sessionId);
            broadcastOnlineCount();
        }
    }

    /**
     * Get current online count.
     */
    public int getOnlineCount() {
        return activeSessions.size();
    }

    /**
     * Check if online count should be shown to all users.
     */
    public boolean isShowOnlineCountToAll() {
        return showOnlineCountToAll.get();
    }

    /**
     * Toggle visibility of online count.
     */
    public boolean toggleShowOnlineCountToAll() {
        boolean newValue = !showOnlineCountToAll.get();
        showOnlineCountToAll.set(newValue);
        broadcastOnlineCount();
        return newValue;
    }

    /**
     * Broadcast online count to all connected clients.
     */
    public void broadcastOnlineCount() {
        messagingTemplate.convertAndSend("/topic/presence", 
            new PresenceUpdate(getOnlineCount(), isShowOnlineCountToAll()));
    }

    /**
     * Presence update payload.
     */
    public record PresenceUpdate(int count, boolean showToAll) {}
}
