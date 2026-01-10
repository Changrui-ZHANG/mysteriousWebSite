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
     * Ensures only one score per user per game type.
     * Updates existing score if new score is better, or creates new one if none
     * exists.
     *
     * @param dto the score submission data
     * @return result containing whether it's a new high score
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

            // Create new score (this ensures only one score exists)
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

    /**
     * Delete all scores for a specific game type.
     * This is an admin utility method to clean up game data.
     *
     * @param gameType the game type to clear
     * @return number of scores deleted
     */
    @Transactional
    public int deleteAllScoresForGame(String gameType) {
        log.info("Starting deletion of all scores for game: {}", gameType);

        try {
            // Get all scores for this game type (not just top 50)
            List<Score> scores = scoreRepository.findByGameType(gameType);
            int totalCount = scores.size();

            if (totalCount == 0) {
                log.info("No scores found for game: {}", gameType);
                return 0;
            }

            // Delete all scores for this game type
            scoreRepository.deleteAll(scores);

            log.info("Deleted {} scores for game: {}", totalCount, gameType);
            return totalCount;
        } catch (Exception e) {
            log.error("Error deleting scores for game {}: ", gameType, e);
            throw new RuntimeException("Failed to delete scores for game: " + gameType, e);
        }
    }

    /**
     * Clean up duplicate scores - keep only the best score per user per game type.
     * This is an admin utility method to fix existing data.
     */
    @Transactional
    public int cleanupDuplicateScores() {
        log.info("Starting cleanup of duplicate scores...");

        // Get all scores
        List<Score> allScores = scoreRepository.findAll();
        log.info("Found {} total scores in database", allScores.size());

        Map<String, List<Score>> scoresByUserAndGame = new HashMap<>();

        // Group scores by userId + gameType
        for (Score score : allScores) {
            if (score.getUserId() != null && score.getGameType() != null) {
                String key = score.getUserId() + ":" + score.getGameType();
                scoresByUserAndGame.computeIfAbsent(key, k -> new ArrayList<>()).add(score);
            }
        }

        int duplicatesRemoved = 0;
        int duplicateGroups = 0;

        // For each user-game combination, keep only the best score
        for (Map.Entry<String, List<Score>> entry : scoresByUserAndGame.entrySet()) {
            List<Score> scores = entry.getValue();
            if (scores.size() > 1) {
                duplicateGroups++;
                String gameType = scores.get(0).getGameType();
                String userId = scores.get(0).getUserId();

                log.info("Found {} duplicate scores for user {} in game {}", scores.size(), userId, gameType);

                // Find the best score
                Score bestScore = findBestScore(scores, gameType);
                log.info("Best score for user {} in game {}: {} (ID: {})", userId, gameType, bestScore.getScore(),
                        bestScore.getId());

                // Remove all others
                List<Score> toDelete = new ArrayList<>();
                for (Score s : scores) {
                    if (!s.getId().equals(bestScore.getId())) {
                        toDelete.add(s);
                        log.info("Marking for deletion: Score {} (ID: {}) for user {} in game {}",
                                s.getScore(), s.getId(), s.getUserId(), s.getGameType());
                    }
                }

                if (!toDelete.isEmpty()) {
                    try {
                        scoreRepository.deleteAll(toDelete);
                        duplicatesRemoved += toDelete.size();
                        log.info("Successfully deleted {} duplicate scores for user {} in game {}",
                                toDelete.size(), userId, gameType);
                    } catch (Exception e) {
                        log.error("Failed to delete duplicate scores for user {} in game {}: ", userId, gameType, e);
                    }
                }
            }
        }

        log.info("Cleanup completed. Found {} groups with duplicates, removed {} duplicate scores.",
                duplicateGroups, duplicatesRemoved);
        return duplicatesRemoved;
    }

    /**
     * Diagnostic method to count duplicate scores without deleting them.
     * This helps understand the current state of the database.
     */
    public Map<String, Object> getDuplicateScoresReport() {
        log.info("Generating duplicate scores report...");

        List<Score> allScores = scoreRepository.findAll();
        Map<String, List<Score>> scoresByUserAndGame = new HashMap<>();

        // Group scores by userId + gameType
        for (Score score : allScores) {
            if (score.getUserId() != null && score.getGameType() != null) {
                String key = score.getUserId() + ":" + score.getGameType();
                scoresByUserAndGame.computeIfAbsent(key, k -> new ArrayList<>()).add(score);
            }
        }

        int totalScores = allScores.size();
        int duplicateGroups = 0;
        int totalDuplicates = 0;
        List<String> duplicateDetails = new ArrayList<>();

        for (Map.Entry<String, List<Score>> entry : scoresByUserAndGame.entrySet()) {
            List<Score> scores = entry.getValue();
            if (scores.size() > 1) {
                duplicateGroups++;
                totalDuplicates += (scores.size() - 1); // -1 because we keep the best one

                String userId = scores.get(0).getUserId();
                String gameType = scores.get(0).getGameType();
                duplicateDetails.add(String.format("User %s in game %s: %d scores", userId, gameType, scores.size()));
            }
        }

        Map<String, Object> report = new HashMap<>();
        report.put("totalScores", totalScores);
        report.put("duplicateGroups", duplicateGroups);
        report.put("totalDuplicates", totalDuplicates);
        report.put("duplicateDetails", duplicateDetails);

        log.info("Duplicate report: {} total scores, {} groups with duplicates, {} duplicates to remove",
                totalScores, duplicateGroups, totalDuplicates);

        return report;
    }

    /**
     * Alternative method to cleanup duplicates using a more direct approach.
     * This method deletes duplicates one by one and commits after each deletion.
     */
    @Transactional
    public int forceCleanupDuplicates() {
        log.info("Starting FORCE cleanup of duplicate scores...");

        List<Score> allScores = scoreRepository.findAll();
        log.info("Found {} total scores in database", allScores.size());

        // Group by user and game type
        Map<String, List<Score>> scoresByUserAndGame = new HashMap<>();
        for (Score score : allScores) {
            if (score.getUserId() != null && score.getGameType() != null) {
                String key = score.getUserId() + ":" + score.getGameType();
                scoresByUserAndGame.computeIfAbsent(key, k -> new ArrayList<>()).add(score);
            }
        }

        int totalDeleted = 0;

        for (Map.Entry<String, List<Score>> entry : scoresByUserAndGame.entrySet()) {
            List<Score> scores = entry.getValue();
            if (scores.size() > 1) {
                String gameType = scores.get(0).getGameType();
                String userId = scores.get(0).getUserId();

                log.info("Processing {} duplicate scores for user {} in game {}", scores.size(), userId, gameType);

                // Sort scores to find the best one
                Score bestScore = findBestScore(scores, gameType);
                log.info("Best score: {} (ID: {})", bestScore.getScore(), bestScore.getId());

                // Delete all others one by one
                for (Score score : scores) {
                    if (!score.getId().equals(bestScore.getId())) {
                        try {
                            log.info("Deleting score: {} (ID: {}) for user {} in game {}",
                                    score.getScore(), score.getId(), userId, gameType);
                            scoreRepository.deleteById(score.getId());
                            totalDeleted++;
                            log.info("Successfully deleted score ID: {}", score.getId());
                        } catch (Exception e) {
                            log.error("Failed to delete score ID {}: ", score.getId(), e);
                        }
                    }
                }
            }
        }

        log.info("FORCE cleanup completed. Deleted {} duplicate scores.", totalDeleted);
        return totalDeleted;
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
        scoreRepository.save(newScore);
    }

    /**
     * Result of score submission.
     */
    public record ScoreSubmissionResult(boolean newHighScore, String message) {
    }
}
