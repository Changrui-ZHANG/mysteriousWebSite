package com.changrui.mysterious.domain.game.service;

import com.changrui.mysterious.domain.game.dto.ScoreSubmissionDTO;
import com.changrui.mysterious.domain.game.model.Score;
import com.changrui.mysterious.domain.game.repository.ScoreRepository;
import com.changrui.mysterious.shared.exception.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for managing game scores.
 * Handles score submission, retrieval, and leaderboard logic.
 */
@Service
public class ScoreService {

    private static final Logger log = LoggerFactory.getLogger(ScoreService.class);
    private static final int TOP_SCORES_LIMIT = 3;

    @Autowired
    private ScoreRepository scoreRepository;

    /**
     * Get top scores for a specific game type.
     * Returns top 3 unique scores (one per user).
     * For maze game, lower scores are better (ascending).
     * For other games, higher scores are better (descending).
     *
     * @param gameType the type of game
     * @return list of top scores
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
     *
     * @param userId   the user ID
     * @param gameType the game type
     * @return the user's best score, or empty score if not found
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
     * Only saves if it's better than the user's existing best score.
     *
     * @param dto the score submission data
     * @return result containing whether it's a new high score
     */
    @Transactional
    public ScoreSubmissionResult submitScore(ScoreSubmissionDTO dto) {
        log.info("Processing {} score: {} for user: {}", dto.gameType(), dto.score(), dto.userId());

        List<Score> existingScores = scoreRepository.findByUserIdAndGameType(dto.userId(), dto.gameType());

        if (!existingScores.isEmpty()) {
            Score bestScore = findBestScore(existingScores, dto.gameType());

            if (!isNewScoreBetter(dto.score(), bestScore.getScore(), dto.gameType())) {
                log.debug("Score {} is not better than existing {}", dto.score(), bestScore.getScore());
                return new ScoreSubmissionResult(false, "Score not high enough");
            }

            updateExistingScore(bestScore, dto);
            log.info("Updated existing score for user {} in game {}: {}", dto.userId(), dto.gameType(), dto.score());
            return new ScoreSubmissionResult(true, "Score updated successfully");
        }

        createNewScore(dto);
        log.info("Score saved successfully for user {} in game {}: {}", dto.userId(), dto.gameType(), dto.score());
        return new ScoreSubmissionResult(true, "Score submitted successfully");
    }

    /**
     * Delete a score by ID.
     *
     * @param id the score ID
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
                if (isAscending && s.getScore() == 0) continue;
                seenUsers.add(s.getUserId());
                topScores.add(s);
                if (topScores.size() >= TOP_SCORES_LIMIT) break;
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

    private void updateExistingScore(Score score, ScoreSubmissionDTO dto) {
        score.setScore(dto.score());
        score.setTimestamp(System.currentTimeMillis());
        score.setAttempts(dto.attempts());
        scoreRepository.save(score);
    }

    private void createNewScore(ScoreSubmissionDTO dto) {
        Score newScore = new Score(
                dto.username(),
                dto.userId(),
                dto.gameType(),
                dto.score(),
                System.currentTimeMillis(),
                dto.attempts());
        scoreRepository.save(newScore);
    }

    /**
     * Result of score submission.
     */
    public record ScoreSubmissionResult(boolean newHighScore, String message) {}
}
