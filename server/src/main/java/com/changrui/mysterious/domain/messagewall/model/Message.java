package com.changrui.mysterious.domain.messagewall.model;

import com.changrui.mysterious.domain.messagewall.converter.ReactionsConverter;
import com.changrui.mysterious.domain.messagewall.model.MessageReaction;
import jakarta.persistence.*;
import java.util.LinkedList;
import java.util.List;

/**
 * Entity representing a chat message.
 * Maps to the 'messages' table in the database.
 */
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
    private List<MessageReaction> reactions;

    @Column(name = "image_url")
    private String imageUrl;

    public Message() {
        this.reactions = new LinkedList<>();
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
        this.reactions = new LinkedList<>();
    }

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

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public List<MessageReaction> getReactions() {
        return reactions != null ? reactions : new LinkedList<>();
    }

    public void setReactions(List<MessageReaction> reactions) {
        this.reactions = reactions;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
