package com.changrui.mysterious.domain.messagewall.model;

import com.changrui.mysterious.domain.messagewall.converter.ReactionsConverter;
import jakarta.persistence.*;
import java.util.LinkedList;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a chat message.
 * Maps to the 'messages' table in the database.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private long timestamp;

    @Column(name = "is_anonymous", nullable = false, columnDefinition = "boolean default false")
    private boolean isAnonymous;

    @Column(name = "is_verified", nullable = false, columnDefinition = "boolean default false")
    private boolean isVerified;

    @Column(name = "quoted_message_id")
    private String quotedMessageId;

    @Column(name = "quoted_name")
    private String quotedName;

    @Column(name = "quoted_message", length = 500)
    private String quotedMessage;

    @Column(name = "channel_id")
    private String channelId;

    @Column(name = "reactions", columnDefinition = "TEXT")
    @Convert(converter = ReactionsConverter.class)
    private List<MessageReaction> reactions = new LinkedList<>();

    @Column(name = "image_url")
    private String imageUrl;

    public Message(String id, String userId, String name, String message, long timestamp, boolean isAnonymous,
            boolean isVerified) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.message = message;
        this.timestamp = timestamp;
        this.isAnonymous = isAnonymous;
        this.isVerified = isVerified;
        this.reactions = new LinkedList<>();
    }

    // Custom getter for reactions to ensure non-null
    public List<MessageReaction> getReactions() {
        return reactions != null ? reactions : new LinkedList<>();
    }
}
