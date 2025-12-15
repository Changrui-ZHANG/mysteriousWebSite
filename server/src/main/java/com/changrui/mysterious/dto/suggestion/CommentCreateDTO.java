package com.changrui.mysterious.dto.suggestion;

import jakarta.validation.constraints.NotBlank;

public record CommentCreateDTO(
                @NotBlank(message = "User ID is required") String userId,

                @NotBlank(message = "Username is required") String username,

                @NotBlank(message = "Content is required") String content,
                String quotedCommentId) {
}
