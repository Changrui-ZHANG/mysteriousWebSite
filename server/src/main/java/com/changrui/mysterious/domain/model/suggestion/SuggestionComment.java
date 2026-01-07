package com.changrui.mysterious.domain.model.suggestion;

import java.time.LocalDateTime;

public class SuggestionComment {

    private final String id;
    private final String suggestionId;
    private final String userId;
    private final String username;
    private final String content;
    private final LocalDateTime timestamp;

    // Quoted comment details (optional)
    private String quotedCommentId;
    private String quotedUsername;
    private String quotedContent;

    private SuggestionComment(String id, String suggestionId, String userId, String username, String content,
            LocalDateTime timestamp) {
        this.id = id;
        this.suggestionId = suggestionId;
        this.userId = userId;
        this.username = username;
        this.content = content;
        this.timestamp = timestamp;
    }

    public static SuggestionComment create(String suggestionId, String userId, String username, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        return new SuggestionComment(null, suggestionId, userId, username, content, LocalDateTime.now());
    }

    public static SuggestionComment reconstitute(String id, String suggestionId, String userId, String username,
            String content, LocalDateTime timestamp,
            String quotedCommentId, String quotedUsername, String quotedContent) {
        SuggestionComment comment = new SuggestionComment(id, suggestionId, userId, username, content, timestamp);
        comment.quotedCommentId = quotedCommentId;
        comment.quotedUsername = quotedUsername;
        comment.quotedContent = quotedContent;
        return comment;
    }

    public void setQuote(String quotedCommentId, String quotedUsername, String quotedContent) {
        this.quotedCommentId = quotedCommentId;
        this.quotedUsername = quotedUsername;
        this.quotedContent = quotedContent;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getSuggestionId() {
        return suggestionId;
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

    public String getQuotedCommentId() {
        return quotedCommentId;
    }

    public String getQuotedUsername() {
        return quotedUsername;
    }

    public String getQuotedContent() {
        return quotedContent;
    }
}
