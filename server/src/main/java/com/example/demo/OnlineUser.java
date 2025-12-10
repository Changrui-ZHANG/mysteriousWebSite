package com.example.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "online_users")
public class OnlineUser {

    @Id
    private String userId;

    @Column(nullable = false)
    private LocalDateTime lastHeartbeat;

    public OnlineUser() {
    }

    public OnlineUser(String userId) {
        this.userId = userId;
        this.lastHeartbeat = LocalDateTime.now();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getLastHeartbeat() {
        return lastHeartbeat;
    }

    public void setLastHeartbeat(LocalDateTime lastHeartbeat) {
        this.lastHeartbeat = lastHeartbeat;
    }

    public void updateHeartbeat() {
        this.lastHeartbeat = LocalDateTime.now();
    }
}
