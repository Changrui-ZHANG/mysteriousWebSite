package com.changrui.mysterious.application.service.game;

import com.changrui.mysterious.domain.model.game.GameStatus;
import com.changrui.mysterious.domain.model.game.Score;
import com.changrui.mysterious.domain.port.in.game.ScoreUseCases;
import com.changrui.mysterious.domain.port.out.GameStatusRepository;
import com.changrui.mysterious.domain.port.out.ScoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class ScoreManagementService implements ScoreUseCases {

    private final ScoreRepository scoreRepository;
    private final GameStatusRepository gameStatusRepository;

    public ScoreManagementService(ScoreRepository scoreRepository, GameStatusRepository gameStatusRepository) {
        this.scoreRepository = scoreRepository;
        this.gameStatusRepository = gameStatusRepository;
    }

    @Override
    public ScoreSubmissionResult submitScore(SubmitScoreCommand command) {
        String userId = command.userId();
        String gameType = command.gameType();
        int score = command.score();

        // Check existing best score logic
        Optional<Score> bestScoreOpt = getUserBestScore(userId, gameType);

        boolean isMaze = "maze".equals(gameType);

        if (bestScoreOpt.isPresent()) {
            Score bestScore = bestScoreOpt.get();
            if (isMaze) {
                // ASC: Lower is better. New score must be LOWER.
                if (score >= bestScore.getScore() && bestScore.getScore() != 0) {
                    return new ScoreSubmissionResult(false, "Score not high enough");
                }
            } else {
                // DESC: Higher is better. New score must be HIGHER.
                if (score <= bestScore.getScore()) {
                    return new ScoreSubmissionResult(false, "Score not high enough");
                }
            }
        }

        // Save new score
        Score newScore = Score.create(userId, command.username(), gameType, score, command.attempts());
        scoreRepository.save(newScore);

        return new ScoreSubmissionResult(true, "Score submitted successfully");
    }

    @Override
    public List<Score> getTopScores(String gameType) {
        boolean isMaze = "maze".equals(gameType);
        List<Score> rawScores;

        // Get more than needed to handle duplication filtering
        if (isMaze) {
            rawScores = scoreRepository.findTopScoresAsc(gameType, 50);
        } else {
            rawScores = scoreRepository.findTopScoresDesc(gameType, 50);
        }

        // Deduplication: One score per user
        List<Score> topScores = new ArrayList<>();
        Set<String> seenUsers = new HashSet<>();

        for (Score s : rawScores) {
            if (s.getUserId() != null && !seenUsers.contains(s.getUserId())) {
                // Maze specific: filter out 0 scores if they are defaults
                if (isMaze && s.getScore() == 0)
                    continue;

                seenUsers.add(s.getUserId());
                topScores.add(s);
                if (topScores.size() >= 3)
                    break;
            }
        }

        return topScores;
    }

    @Override
    public Optional<Score> getUserBestScore(String userId, String gameType) {
        if ("maze".equals(gameType)) {
            return scoreRepository.findUserBestScoreAsc(userId, gameType);
        } else {
            return scoreRepository.findUserBestScoreDesc(userId, gameType);
        }
    }

    // --- Game Status ---
    @Override
    public List<GameStatus> getAllGameStatuses() {
        return gameStatusRepository.findAll();
    }

    @Override
    public GameStatus getGameStatus(String gameType) {
        return gameStatusRepository.findByGameType(gameType)
                .orElse(GameStatus.create(gameType, true)); // Default enabled
    }

    @Override
    public void setGameStatus(String gameType, boolean enabled) {
        GameStatus status = gameStatusRepository.findByGameType(gameType)
                .orElse(GameStatus.create(gameType, enabled));

        status.setEnabled(enabled);
        gameStatusRepository.save(status);
    }
}
