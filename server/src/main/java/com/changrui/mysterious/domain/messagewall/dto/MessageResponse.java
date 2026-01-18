package com.changrui.mysterious.domain.messagewall.dto;

import com.changrui.mysterious.domain.messagewall.model.MessageReaction;
import java.util.List;

/**
 * DTO for sending message data to the client.
 * Decouples the API from the Database Entity.
 */
public class MessageResponse {
    private String id;
    private String userId;
    private String name;
    private String message;
    private long timestamp;
    private boolean isAnonymous;
    private boolean isVerified;
    private String quotedMessageId;
    private String quotedName;
    private String quotedMessage;
    private String channelId;
    private List<MessageReaction> reactions;
    private String imageUrl;

    // Potential future fields for profile integration
    // private String avatarUrl;

    public MessageResponse() {
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
        return reactions;
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
