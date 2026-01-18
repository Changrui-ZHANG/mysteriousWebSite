package com.changrui.mysterious.domain.game.service;

import com.changrui.mysterious.domain.game.model.Score;
import com.changrui.mysterious.domain.game.repository.ScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for administrative maintenance of game scores.
 * Handles deduplication, cleanup, and reporting.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScoreMaintenanceService {

    private final ScoreRepository scoreRepository;

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

        Map<String, List<Score>> scoresByUserAndGame = groupScoresByUserAndGame(allScores);

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
     */
    public Map<String, Object> getDuplicateScoresReport() {
        log.info("Generating duplicate scores report...");

        List<Score> allScores = scoreRepository.findAll();
        Map<String, List<Score>> scoresByUserAndGame = groupScoresByUserAndGame(allScores);

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
     */
    @Transactional
    public int forceCleanupDuplicates() {
        log.info("Starting FORCE cleanup of duplicate scores...");

        List<Score> allScores = scoreRepository.findAll();
        log.info("Found {} total scores in database", allScores.size());

        Map<String, List<Score>> scoresByUserAndGame = groupScoresByUserAndGame(allScores);

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

    // --- Private Helpers ---

    private Map<String, List<Score>> groupScoresByUserAndGame(List<Score> allScores) {
        Map<String, List<Score>> scoresByUserAndGame = new HashMap<>();
        for (Score score : allScores) {
            if (score.getUserId() != null && score.getGameType() != null) {
                String key = score.getUserId() + ":" + score.getGameType();
                scoresByUserAndGame.computeIfAbsent(key, k -> new ArrayList<>()).add(score);
            }
        }
        return scoresByUserAndGame;
    }

    private Score findBestScore(List<Score> scores, String gameType) {
        if (isMazeGame(gameType)) {
            scores.sort(Comparator.comparingInt(Score::getScore));
        } else {
            scores.sort((s1, s2) -> Integer.compare(s2.getScore(), s1.getScore()));
        }
        return scores.get(0);
    }

    private boolean isMazeGame(String gameType) {
        return "maze".equals(gameType);
    }
}