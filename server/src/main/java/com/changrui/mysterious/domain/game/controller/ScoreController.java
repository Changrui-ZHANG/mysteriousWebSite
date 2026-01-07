package com.changrui.mysterious.domain.game.controller;

import com.changrui.mysterious.domain.game.dto.ScoreSubmissionDTO;
import com.changrui.mysterious.domain.game.model.Score;
import com.changrui.mysterious.domain.game.repository.ScoreRepository;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.EntityNotFoundException;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller for managing game scores.
 */
@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    private static final Logger log = LoggerFactory.getLogger(ScoreController.class);

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private AdminService adminService;

    @GetMapping("/top/{gameType}")
    public ResponseEntity<ApiResponse<List<Score>>> getTopScores(@PathVariable String gameType) {
        List<Score> rawScores;
        boolean asc = "maze".equals(gameType);

        if (asc) {
            rawScores = scoreRepository.findTop50ByGameTypeOrderByScoreAsc(gameType);
        } else {
            rawScores = scoreRepository.findTop50ByGameTypeOrderByScoreDesc(gameType);
        }

        List<Score> topScores = new ArrayList<>();
        Set<String> seenUsers = new HashSet<>();

        for (Score s : rawScores) {
            if (s.getUserId() != null && !seenUsers.contains(s.getUserId())) {
                if (asc && s.getScore() == 0) continue;
                seenUsers.add(s.getUserId());
                topScores.add(s);
                if (topScores.size() >= 3) break;
            }
        }

        return ResponseEntity.ok(ApiResponse.success(topScores));
    }

    @GetMapping("/user/{userId}/{gameType}")
    public ResponseEntity<ApiResponse<Score>> getUserHighScore(
            @PathVariable String userId,
            @PathVariable String gameType) {

        Score score;
        if ("maze".equals(gameType)) {
            score = scoreRepository.findTopByUserIdAndGameTypeOrderByScoreAsc(userId, gameType);
        } else {
            score = scoreRepository.findTopByUserIdAndGameTypeOrderByScoreDesc(userId, gameType);
        }

        if (score == null) {
            Score emptyScore = new Score();
            emptyScore.setUserId(userId);
            emptyScore.setGameType(gameType);
            emptyScore.setScore(0);
            return ResponseEntity.ok(ApiResponse.success(emptyScore));
        }
        return ResponseEntity.ok(ApiResponse.success(score));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitScore(
            @Valid @RequestBody ScoreSubmissionDTO dto) {

        log.debug("Entering submitScore");
        log.info("Processing {} score: {} for user: {}", dto.gameType(), dto.score(), dto.userId());

        List<Score> existingScores = scoreRepository.findByUserIdAndGameType(dto.userId(), dto.gameType());

        if (!existingScores.isEmpty()) {
            if ("maze".equals(dto.gameType())) {
                existingScores.sort((s1, s2) -> Integer.compare(s1.getScore(), s2.getScore()));
            } else {
                existingScores.sort((s1, s2) -> Integer.compare(s2.getScore(), s1.getScore()));
            }

            Score bestScore = existingScores.get(0);

            if ("maze".equals(dto.gameType())) {
                if (dto.score() >= bestScore.getScore() && bestScore.getScore() != 0) {
                    log.debug("Score {} is not better than existing {}", dto.score(), bestScore.getScore());
                    return ResponseEntity.ok(ApiResponse.success(
                            "Score not high enough",
                            Map.of("message", "Score not high enough", "newHighScore", false)));
                }
            } else {
                if (dto.score() <= bestScore.getScore()) {
                    log.debug("Score {} is not better than existing {}", dto.score(), bestScore.getScore());
                    return ResponseEntity.ok(ApiResponse.success(
                            "Score not high enough",
                            Map.of("message", "Score not high enough", "newHighScore", false)));
                }
            }

            bestScore.setScore(dto.score());
            bestScore.setTimestamp(System.currentTimeMillis());
            bestScore.setAttempts(dto.attempts());
            scoreRepository.save(bestScore);

            log.info("Updated existing score for user {} in game {}: {}", dto.userId(), dto.gameType(), dto.score());

            return ResponseEntity.ok(ApiResponse.success(
                    "Score updated successfully",
                    Map.of("message", "Score updated successfully", "newHighScore", true)));
        }

        Score newScore = new Score(
                dto.username(),
                dto.userId(),
                dto.gameType(),
                dto.score(),
                System.currentTimeMillis(),
                dto.attempts());
        scoreRepository.save(newScore);
        log.info("Score saved successfully for user {} in game {}: {}", dto.userId(), dto.gameType(), dto.score());

        return ResponseEntity.ok(ApiResponse.success(
                "Score submitted successfully",
                Map.of("message", "Score submitted successfully", "newHighScore", true)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteScore(
            @PathVariable String id,
            @RequestParam String adminCode) {

        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        if (!scoreRepository.existsById(id)) {
            throw new EntityNotFoundException("Score", id);
        }

        scoreRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.successMessage("Score deleted successfully"));
    }
}
