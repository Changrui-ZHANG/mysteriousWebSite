package com.example.demo;

import jakarta.persistence.*;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private long timestamp;

    @Column(name = "is_anonymous", nullable = false)
    private boolean isAnonymous;

    // Constructors
    public Message() {
    }

    public Message(String id, String userId, String name, String message, long timestamp, boolean isAnonymous) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.message = message;
        this.timestamp = timestamp;
        this.isAnonymous = isAnonymous;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isAnonymous() {
        return isAnonymous;
    }

    public void setAnonymous(boolean anonymous) {
        isAnonymous = anonymous;
    }
}
