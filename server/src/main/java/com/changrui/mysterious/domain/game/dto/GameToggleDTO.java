package com.changrui.mysterious.domain.game.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for game toggle requests.
 */
public record GameToggleDTO(
        @NotBlank(message = "Admin code is required")
        String adminCode
) {}
