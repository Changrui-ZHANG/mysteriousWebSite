package com.changrui.mysterious.application.dto.suggestion;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentDTO(
        @NotBlank String userId,
        @NotBlank String username,
        @NotBlank String content,
        String quotedCommentId) {
}
