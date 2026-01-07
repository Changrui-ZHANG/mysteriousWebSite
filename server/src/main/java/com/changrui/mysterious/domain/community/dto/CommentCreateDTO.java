package com.changrui.mysterious.domain.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating a new comment on a suggestion.
 */
public record CommentCreateDTO(
        @NotBlank(message = "User ID is required")
        String userId,

        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Content is required")
        @Size(max = 1000, message = "Content must be at most 1000 characters")
        String content,

        String quotedCommentId
) {}
