package com.changrui.mysterious.domain.port.in.message;

import com.changrui.mysterious.domain.model.message.Message;
import com.changrui.mysterious.domain.model.user.UserId;

import java.util.List;

public interface MessageUseCases {

    Message sendMessage(SendMessageCommand command);

    List<Message> getRecentMessages();

    void deleteMessage(String id, String userId, boolean isAdmin);

    void deleteAllMessages();

    boolean toggleMute();

    boolean isMuted();

    record SendMessageCommand(
            String content,
            String authorName,
            UserId authorId,
            String quotedMessageId,
            String quotedAuthorName,
            String quotedContent) {
        public SendMessageCommand {
            if (content == null || content.isBlank()) {
                throw new IllegalArgumentException("Content is required");
            }
        }
    }
}
