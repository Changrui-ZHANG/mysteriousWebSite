package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.dto.game.ScoreDTO;
import com.changrui.mysterious.application.dto.game.SubmitScoreDTO;
import com.changrui.mysterious.application.dto.common.ApiResponse;
import com.changrui.mysterious.domain.model.game.Score;
import com.changrui.mysterious.domain.port.in.game.ScoreUseCases;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    private final ScoreUseCases scoreUseCases;

    public ScoreController(ScoreUseCases scoreUseCases) {
        this.scoreUseCases = scoreUseCases;
    }

    @GetMapping("/top/{gameType}")
    public ResponseEntity<ApiResponse<List<ScoreDTO>>> getTopScores(@PathVariable String gameType) {
        List<ScoreDTO> scores = scoreUseCases.getTopScores(gameType).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(scores));
    }

    @GetMapping("/user/{userId}/{gameType}")
    public ResponseEntity<ApiResponse<ScoreDTO>> getUserBestScore(
            @PathVariable String userId,
            @PathVariable String gameType) {
        Optional<Score> scoreOpt = scoreUseCases.getUserBestScore(userId, gameType);
        return ResponseEntity.ok(ApiResponse.success(
                scoreOpt.map(this::toDTO).orElse(new ScoreDTO(null, 0, null))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitScore(@Valid @RequestBody SubmitScoreDTO dto) {
        var command = new ScoreUseCases.SubmitScoreCommand(
                dto.userId(),
                dto.username(),
                dto.gameType(),
                dto.score(),
                dto.attempts());

        var result = scoreUseCases.submitScore(command);

        return ResponseEntity.ok(ApiResponse.successMessage(result.message()));
    }

    private ScoreDTO toDTO(Score score) {
        if (score == null)
            return null;
        return new ScoreDTO(score.getUsername(), score.getScore(), score.getAttempts());
    }
}
