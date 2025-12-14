package com.changrui.mysterious.dto.game;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for toggling game status
 */
public record GameToggleDTO(
                @NotBlank(message = "Game type is required") String gameType,

                @NotBlank(message = "Admin code is required") String adminCode) {
}