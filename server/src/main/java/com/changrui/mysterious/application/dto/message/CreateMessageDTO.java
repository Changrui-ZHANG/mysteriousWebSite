package com.changrui.mysterious.application.dto.message;

import jakarta.validation.constraints.NotBlank;

public record CreateMessageDTO(
        @NotBlank(message = "Content is required") String content,

        String authorName,
        String authorId,
        String quotedMessageId) {
}
