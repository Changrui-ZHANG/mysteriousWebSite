package com.changrui.mysterious.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "suggestion_comments")
public class SuggestionCommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String suggestionId;
    private String userId;
    private String username;
    @Column(length = 1000)
    private String content;
    private LocalDateTime timestamp;

    private String quotedCommentId;
    private String quotedUsername;
    private String quotedContent;

    public SuggestionCommentEntity() {
    }

    // Getters/Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSuggestionId() {
        return suggestionId;
    }

    public void setSuggestionId(String suggestionId) {
        this.suggestionId = suggestionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getQuotedCommentId() {
        return quotedCommentId;
    }

    public void setQuotedCommentId(String quotedCommentId) {
        this.quotedCommentId = quotedCommentId;
    }

    public String getQuotedUsername() {
        return quotedUsername;
    }

    public void setQuotedUsername(String quotedUsername) {
        this.quotedUsername = quotedUsername;
    }

    public String getQuotedContent() {
        return quotedContent;
    }

    public void setQuotedContent(String quotedContent) {
        this.quotedContent = quotedContent;
    }
}
