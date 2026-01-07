package com.changrui.mysterious.application.dto.game;

public record ScoreDTO(
        String username,
        int score,
        Integer attempts // Optional
) {
}
