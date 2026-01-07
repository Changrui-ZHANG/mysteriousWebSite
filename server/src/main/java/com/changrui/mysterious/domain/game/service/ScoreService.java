package com.changrui.mysterious.domain.game.service;

import com.changrui.mysterious.domain.game.model.Score;
import com.changrui.mysterious.domain.game.repository.ScoreRepository;
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
     */
    public List<Score> getTopScores(String gameType) {
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

        return topScores;
    }

    /**
     * Get user's best score for a specific game type.
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
     */
    @Transactional
    public ScoreSubmissionResult submitScore(String userId, String username, String gameType,
            Integer score, Integer attempts) {
        log.info("Processing {} score: {} for user: {}", gameType, score, userId);

        List<Score> existingScores = scoreRepository.findByUserIdAndGameType(userId, gameType);

        if (!existingScores.isEmpty()) {
            if ("maze".equals(gameType)) {
                existingScores.sort((s1, s2) -> Integer.compare(s1.getScore(), s2.getScore()));
            } else {
                existingScores.sort((s1, s2) -> Integer.compare(s2.getScore(), s1.getScore()));
            }

            Score bestScore = existingScores.get(0);

            if ("maze".equals(gameType)) {
                if (score >= bestScore.getScore() && bestScore.getScore() != 0) {
                    log.debug("Score {} is not better than existing {}", score, bestScore.getScore());
                    return new ScoreSubmissionResult(false, "Score not high enough");
                }
            } else {
                if (score <= bestScore.getScore()) {
                    log.debug("Score {} is not better than existing {}", score, bestScore.getScore());
                    return new ScoreSubmissionResult(false, "Score not high enough");
                }
            }
        }

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
