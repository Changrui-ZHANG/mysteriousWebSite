package com.changrui.mysterious.dto.score;

import jakarta.validation.constraints.*;

/**
 * DTO for score submission requests
 */
public record ScoreSubmissionDTO(
        @NotBlank(message = "Game type is required") String gameType,

        @NotNull(message = "Score is required") @Min(value = 0, message = "Score must be non-negative") Integer score,

        @NotBlank(message = "User ID is required") String userId,

        @NotBlank(message = "Username is required") String username,

        @Min(value = 1, message = "Attempts must be at least 1") Integer attempts) {
}
