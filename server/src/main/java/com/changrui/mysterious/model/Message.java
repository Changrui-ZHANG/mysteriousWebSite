package com.changrui.mysterious.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    @JsonProperty("isAnonymous")
    @Column(name = "is_anonymous", nullable = false, columnDefinition = "boolean default false")
    private boolean isAnonymous;

    @JsonProperty("isVerified")
    @Column(name = "is_verified", nullable = false, columnDefinition = "boolean default false")
    private boolean isVerified;

    // Quote fields
    @Column(name = "quoted_message_id")
    private String quotedMessageId;

    @Column(name = "quoted_name")
    private String quotedName;

    @Column(name = "quoted_message", length = 500)
    private String quotedMessage;

    // Constructors
    public Message() {
    }

    public Message(String id, String userId, String name, String message, long timestamp, boolean isAnonymous,
            boolean isVerified) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.message = message;
        this.timestamp = timestamp;
        this.isAnonymous = isAnonymous;
        this.isVerified = isVerified;
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

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public String getQuotedMessageId() {
        return quotedMessageId;
    }

    public void setQuotedMessageId(String quotedMessageId) {
        this.quotedMessageId = quotedMessageId;
    }

    public String getQuotedName() {
        return quotedName;
    }

    public void setQuotedName(String quotedName) {
        this.quotedName = quotedName;
    }

    public String getQuotedMessage() {
        return quotedMessage;
    }

    public void setQuotedMessage(String quotedMessage) {
        this.quotedMessage = quotedMessage;
    }
}
