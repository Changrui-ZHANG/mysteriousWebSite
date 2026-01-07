package com.changrui.mysterious.domain.model.message;

import com.changrui.mysterious.domain.model.user.UserId;
import java.time.LocalDateTime;

/**
 * Entité de domaine Message.
 */
public class Message {

    private final Long id; // Domain ID (peut être différent de DB ID, mais ici Long pour simplicité)
    private String content;
    private final String authorName; // Pour les messages anonymes ou snapshot du nom
    private final UserId authorId; // Optionnel (null si anonyme)
    private final LocalDateTime createdAt;
    private boolean isVisible;

    // Quoting support
    private final String quotedMessageId;
    private final String quotedAuthorName;
    private final String quotedContent;

    private Message(Long id, String content, String authorName, UserId authorId, LocalDateTime createdAt,
            boolean isVisible, String quotedMessageId, String quotedAuthorName, String quotedContent) {
        this.id = id;
        this.content = content;
        this.authorName = authorName;
        this.authorId = authorId;
        this.createdAt = createdAt;
        this.isVisible = isVisible;
        this.quotedMessageId = quotedMessageId;
        this.quotedAuthorName = quotedAuthorName;
        this.quotedContent = quotedContent;
    }

    public static Message create(String content, String authorName, UserId authorId) {
        return create(content, authorName, authorId, null, null, null);
    }

    public static Message create(String content, String authorName, UserId authorId,
            String quotedMessageId, String quotedAuthorName, String quotedContent) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }
        return new Message(null, content, authorName, authorId, LocalDateTime.now(), true,
                quotedMessageId, quotedAuthorName, quotedContent);
    }

    public static Message reconstitute(Long id, String content, String authorName, UserId authorId,
            LocalDateTime createdAt, boolean isVisible,
            String quotedMessageId, String quotedAuthorName, String quotedContent) {
        return new Message(id, content, authorName, authorId, createdAt, isVisible,
                quotedMessageId, quotedAuthorName, quotedContent);
    }

    public void hide() {
        this.isVisible = false;
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public String getAuthorName() {
        return authorName;
    }

    public UserId getAuthorId() {
        return authorId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isVisible() {
        return isVisible;
    }

    public String getQuotedMessageId() {
        return quotedMessageId;
    }

    public String getQuotedAuthorName() {
        return quotedAuthorName;
    }

    public String getQuotedContent() {
        return quotedContent;
    }
}
