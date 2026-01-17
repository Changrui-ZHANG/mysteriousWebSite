package com.changrui.mysterious.domain.messagewall.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.LinkedList;
import java.util.List;

/**
 * Represents a reaction to a message.
 * Stored as JSON in the Message entity.
 */
public class MessageReaction {
    
    private String emoji;
    private int count;
    private List<ReactionUser> users;

    public MessageReaction() {
        this.users = new LinkedList<>();
    }

    public MessageReaction(String emoji, int count, List<ReactionUser> users) {
        this.emoji = emoji;
        this.count = count;
        this.users = users != null ? users : new LinkedList<>();
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public List<ReactionUser> getUsers() {
        return users;
    }

    public void setUsers(List<ReactionUser> users) {
        this.users = users;
    }

    /**
     * Inner class representing a user who reacted
     */
    public static class ReactionUser {
        private String userId;
        private String username;
        private long reactedAt;

        public ReactionUser() {
        }

        public ReactionUser(String userId, String username, long reactedAt) {
            this.userId = userId;
            this.username = username;
            this.reactedAt = reactedAt;
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

        public long getReactedAt() {
            return reactedAt;
        }

        public void setReactedAt(long reactedAt) {
            this.reactedAt = reactedAt;
        }
    }
}
