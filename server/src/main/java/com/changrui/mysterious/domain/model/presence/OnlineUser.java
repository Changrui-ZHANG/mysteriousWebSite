package com.changrui.mysterious.domain.model.presence;

import java.time.LocalDateTime;

public class OnlineUser {

    private final String userId;
    private LocalDateTime lastHeartbeat;

    private OnlineUser(String userId, LocalDateTime lastHeartbeat) {
        this.userId = userId;
        this.lastHeartbeat = lastHeartbeat;
    }

    public static OnlineUser create(String userId) {
        return new OnlineUser(userId, LocalDateTime.now());
    }

    public static OnlineUser reconstitute(String userId, LocalDateTime lastHeartbeat) {
        return new OnlineUser(userId, lastHeartbeat);
    }

    public void updateHeartbeat() {
        this.lastHeartbeat = LocalDateTime.now();
    }

    public String getUserId() {
        return userId;
    }

    public LocalDateTime getLastHeartbeat() {
        return lastHeartbeat;
    }
}
