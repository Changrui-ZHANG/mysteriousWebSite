package com.changrui.mysterious.application.dto.game;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record SubmitScoreDTO(
        @NotNull String userId,
        @NotNull String username,
        @NotNull String gameType,
        @PositiveOrZero int score,
        Integer attempts) {
}
