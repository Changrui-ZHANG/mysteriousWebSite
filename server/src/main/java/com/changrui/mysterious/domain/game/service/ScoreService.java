package com.changrui.mysterious.domain.game.service;

import com.changrui.mysterious.domain.game.dto.ScoreSubmissionDTO;
import com.changrui.mysterious.domain.game.model.Score;
import com.changrui.mysterious.domain.game.repository.ScoreRepository;
import com.changrui.mysterious.domain.profile.service.ActivityService;
import com.changrui.mysterious.shared.exception.EntityNotFoundException;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing game scores.
 * Handles score submission, retrieval, and leaderboard logic.
 * For administrative maintenance, see {@link ScoreMaintenanceService}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScoreService {

    private static final int TOP_SCORES_LIMIT = 3;

    private final ScoreRepository scoreRepository;
    private final ActivityService activityService;

    /**
     * Get top scores for a specific game type.
     * Returns top 3 unique scores (one per user).
     * For maze game, lower scores are better (ascending).
     * For other games, higher scores are better (descending).
     */
    public List<Score> getTopScores(String gameType) {
        boolean isAscending = isMazeGame(gameType);
        List<Score> rawScores = isAscending
                ? scoreRepository.findTop50ByGameTypeOrderByScoreAsc(gameType)
                : scoreRepository.findTop50ByGameTypeOrderByScoreDesc(gameType);

        return deduplicateByUser(rawScores, isAscending);
    }

    /**
     * Get user's best score for a specific game type.
     */
    public Score getUserBestScore(String userId, String gameType) {
        Score score = isMazeGame(gameType)
                ? scoreRepository.findTopByUserIdAndGameTypeOrderByScoreAsc(userId, gameType)
                : scoreRepository.findTopByUserIdAndGameTypeOrderByScoreDesc(userId, gameType);

        if (score == null) {
            return createEmptyScore(userId, gameType);
        }
        return score;
    }

    /**
     * Submit a new score for a user.
     * Ensures only one score per user per game type.
     * Updates existing score if new score is better.
     */
    @Transactional
    public ScoreSubmissionResult submitScore(ScoreSubmissionDTO dto) {
        log.info("Processing {} score: {} for user: {}", dto.gameType(), dto.score(), dto.userId());

        List<Score> existingScores = scoreRepository.findByUserIdAndGameType(dto.userId(), dto.gameType());

        if (!existingScores.isEmpty()) {
            // Find the best existing score
            Score bestScore = findBestScore(existingScores, dto.gameType());

            // Check if new score is better
            if (!isNewScoreBetter(dto.score(), bestScore.getScore(), dto.gameType())) {
                log.debug("Score {} is not better than existing {}", dto.score(), bestScore.getScore());
                return new ScoreSubmissionResult(false, "Score not high enough");
            }

            // Delete all existing scores for this user and game type
            scoreRepository.deleteAll(existingScores);
            log.info("Deleted {} existing scores for user {} in game {}", existingScores.size(), dto.userId(),
                    dto.gameType());

            // Create new score
            createNewScore(dto);
            log.info("Created new score for user {} in game {}: {}", dto.userId(), dto.gameType(), dto.score());
            return new ScoreSubmissionResult(true, "Score updated successfully");
        }

        // No existing score, create new one
        createNewScore(dto);
        log.info("Score saved successfully for user {} in game {}: {}", dto.userId(), dto.gameType(), dto.score());
        return new ScoreSubmissionResult(true, "Score submitted successfully");
    }

    /**
     * Delete a score by ID.
     */
    @Transactional
    public void deleteScore(String id) {
        if (!scoreRepository.existsById(id)) {
            throw new EntityNotFoundException("Score", id);
        }
        scoreRepository.deleteById(id);
        log.info("Deleted score: {}", id);
    }

    // --- Private helper methods ---

    private boolean isMazeGame(String gameType) {
        return "maze".equals(gameType);
    }

    private List<Score> deduplicateByUser(List<Score> scores, boolean isAscending) {
        List<Score> topScores = new ArrayList<>();
        Set<String> seenUsers = new HashSet<>();

        for (Score s : scores) {
            if (s.getUserId() != null && !seenUsers.contains(s.getUserId())) {
                if (isAscending && s.getScore() == 0)
                    continue;
                seenUsers.add(s.getUserId());
                topScores.add(s);
                if (topScores.size() >= TOP_SCORES_LIMIT)
                    break;
            }
        }
        return topScores;
    }

    private Score createEmptyScore(String userId, String gameType) {
        Score emptyScore = new Score();
        emptyScore.setUserId(userId);
        emptyScore.setGameType(gameType);
        emptyScore.setScore(0);
        return emptyScore;
    }

    private Score findBestScore(List<Score> scores, String gameType) {
        if (isMazeGame(gameType)) {
            scores.sort(Comparator.comparingInt(Score::getScore));
        } else {
            scores.sort((s1, s2) -> Integer.compare(s2.getScore(), s1.getScore()));
        }
        return scores.get(0);
    }

    private boolean isNewScoreBetter(int newScore, int existingScore, String gameType) {
        if (isMazeGame(gameType)) {
            return existingScore == 0 || newScore < existingScore;
        }
        return newScore > existingScore;
    }

    private void createNewScore(ScoreSubmissionDTO dto) {
        Score newScore = new Score(
                dto.username(),
                dto.userId(),
                dto.gameType(),
                dto.score(),
                System.currentTimeMillis(),
                dto.attempts());
        Score savedScore = scoreRepository.save(newScore);

        // Record activity for profile statistics
        if (savedScore.getUserId() != null && !savedScore.getUserId().isEmpty()) {
            try {
                activityService.recordGameActivity(savedScore.getUserId(), savedScore.getGameType(),
                        savedScore.getScore());
            } catch (Exception e) {
                log.warn("Failed to record game activity for user {}: {}", savedScore.getUserId(), e.getMessage());
            }
        }
    }

    public record ScoreSubmissionResult(boolean newHighScore, String message) {
    }
}
