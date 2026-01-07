package com.changrui.mysterious.application.dto.suggestion;

import java.time.LocalDateTime;

public record CommentDTO(
        String id,
        String suggestionId,
        String userId,
        String username,
        String content,
        LocalDateTime timestamp,
        String quotedCommentId,
        String quotedUsername,
        String quotedContent) {
}
