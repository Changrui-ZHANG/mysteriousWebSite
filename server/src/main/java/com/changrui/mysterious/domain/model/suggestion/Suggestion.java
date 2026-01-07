package com.changrui.mysterious.domain.model.suggestion;

import java.time.LocalDateTime;

public class Suggestion {

    private final String id;
    private final String userId;
    private final String username;
    private String content; // renamed from 'suggestion' to 'content' for clarity
    private final LocalDateTime timestamp;
    private SuggestionStatus status;

    private Suggestion(String id, String userId, String username, String content, LocalDateTime timestamp,
            SuggestionStatus status) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.content = content;
        this.timestamp = timestamp;
        this.status = status;
    }

    public static Suggestion create(String userId, String username, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Suggestion content cannot be empty");
        }
        return new Suggestion(null, userId, username, content, LocalDateTime.now(), SuggestionStatus.PENDING);
    }

    public static Suggestion reconstitute(String id, String userId, String username, String content,
            LocalDateTime timestamp, String status) {
        return new Suggestion(id, userId, username, content, timestamp, SuggestionStatus.fromString(status));
    }

    public void updateStatus(SuggestionStatus newStatus) {
        this.status = newStatus;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public SuggestionStatus getStatus() {
        return status;
    }

    public enum SuggestionStatus {
        PENDING, REVIEWED, IMPLEMENTED;

        public static SuggestionStatus fromString(String status) {
            try {
                return valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return PENDING; // Default
            }
        }

        public String toLowerCase() {
            return name().toLowerCase();
        }
    }
}
