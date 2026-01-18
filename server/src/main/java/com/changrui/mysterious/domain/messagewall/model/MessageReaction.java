package com.changrui.mysterious.domain.messagewall.model;

import java.util.LinkedList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a reaction to a message.
 * Stored as JSON in the Message entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageReaction {

    private String emoji;
    private int count;
    private List<ReactionUser> users = new LinkedList<>();

    /**
     * Inner class representing a user who reacted
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReactionUser {
        private String userId;
        private String username;
        private long reactedAt;
    }
}
