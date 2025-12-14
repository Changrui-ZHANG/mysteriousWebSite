package com.changrui.mysterious.service;

import com.changrui.mysterious.model.Score;
import com.changrui.mysterious.repository.ScoreRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service for managing game scores.
 * Handles score submission, retrieval, and leaderboard logic.
 */
@Service
public class ScoreService {

    private static final Logger log = LoggerFactory.getLogger(ScoreService.class);

    @Autowired
    private ScoreRepository scoreRepository;

    /**
     * Get top scores for a specific game type.
     * Returns top 3 unique scores (one per user).
     * For maze game, lower scores are better (ascending).
     * For other games, higher scores are better (descending).
     *
     * @param gameType The type of game
     * @return List of top 3 scores
     */
    public List<Score> getTopScores(String gameType) {
        List<Score> rawScores;
        boolean asc = "maze".equals(gameType);

        if (asc) {
            rawScores = scoreRepository.findTop50ByGameTypeOrderByScoreAsc(gameType);
        } else {
            rawScores = scoreRepository.findTop50ByGameTypeOrderByScoreDesc(gameType);
        }

        // Java-side Deduplication (One score per user)
        List<Score> topScores = new ArrayList<>();
        Set<String> seenUsers = new HashSet<>();

        for (Score s : rawScores) {
            // Safety check for null userId
            if (s.getUserId() != null && !seenUsers.contains(s.getUserId())) {
                // For Maze, filter out '0' scores if they are considered invalid/defaults
                if (asc && s.getScore() == 0)
                    continue;

                seenUsers.add(s.getUserId());
                topScores.add(s);
                if (topScores.size() >= 3)
                    break;
            }
        }

        return topScores;
    }

    /**
     * Get user's best score for a specific game type.
     *
     * @param userId   The user ID
     * @param gameType The game type
     * @return The user's best score, or null if not found
     */
    public Score getUserBestScore(String userId, String gameType) {
        if ("maze".equals(gameType)) {
            return scoreRepository.findTopByUserIdAndGameTypeOrderByScoreAsc(userId, gameType);
        } else {
            return scoreRepository.findTopByUserIdAndGameTypeOrderByScoreDesc(userId, gameType);
        }
    }

    /**
     * Submit a new score for a user.
     * Only saves the score if it's better than the user's existing best score.
     *
     * @param userId   User ID
     * @param username Username
     * @param gameType Game type
     * @param score    Score value
     * @param attempts Optional attempts count
     * @return Response map with status and message
     */
    @Transactional
    public ScoreSubmissionResult submitScore(String userId, String username, String gameType,
            Integer score, Integer attempts) {
        log.info("Processing {} score: {} for user: {}", gameType, score, userId);

        // Look up existing scores for this user and game
        List<Score> existingScores = scoreRepository.findByUserIdAndGameType(userId, gameType);

        if (!existingScores.isEmpty()) {
            // Sort based on game type logic to find the "best" entry currently in DB
            if ("maze".equals(gameType)) {
                // ASC for Maze (Lower is better)
                existingScores.sort((s1, s2) -> Integer.compare(s1.getScore(), s2.getScore()));
            } else {
                // DESC for others (Higher is better)
                existingScores.sort((s1, s2) -> Integer.compare(s2.getScore(), s1.getScore()));
            }

            // Best existing score
            Score bestScore = existingScores.get(0);

            if ("maze".equals(gameType)) {
                // Lower is better. New score must be LOWER than bestScore.
                if (score >= bestScore.getScore() && bestScore.getScore() != 0) {
                    log.debug("Score {} is not better than existing {}", score, bestScore.getScore());
                    return new ScoreSubmissionResult(false, "Score not high enough");
                }
            } else {
                // Higher is better.
                if (score <= bestScore.getScore()) {
                    log.debug("Score {} is not better than existing {}", score, bestScore.getScore());
                    return new ScoreSubmissionResult(false, "Score not high enough");
                }
            }
        }

        // Create and save new score
        Score newScore = new Score(username, userId, gameType, score, System.currentTimeMillis(), attempts);
        scoreRepository.save(newScore);
        log.info("Score saved successfully for user {} in game {}: {}", userId, gameType, score);

        return new ScoreSubmissionResult(true, "Score submitted successfully");
    }

    /**
     * Result of score submission
     */
    public static class ScoreSubmissionResult {
        private final boolean newHighScore;
        private final String message;

        public ScoreSubmissionResult(boolean newHighScore, String message) {
            this.newHighScore = newHighScore;
            this.message = message;
        }

        public boolean isNewHighScore() {
            return newHighScore;
        }

        public String getMessage() {
            return message;
        }
    }
}
