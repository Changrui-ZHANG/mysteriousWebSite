package com.changrui.mysterious.domain.note.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for note creation and update requests.
 */
public record NoteDTO(
    @NotBlank(message = "User ID is required")
    String userId,

    @NotBlank(message = "Username is required")
    String username,

    @NotBlank(message = "Title is required")
    String title,

    String content,

    @NotBlank(message = "Color is required")
    String color
) {}
