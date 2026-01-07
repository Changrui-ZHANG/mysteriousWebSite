package com.changrui.mysterious.domain.port.in.game;

import com.changrui.mysterious.domain.model.game.GameStatus;
import com.changrui.mysterious.domain.model.game.Score;
import java.util.List;
import java.util.Optional;

public interface ScoreUseCases {
    ScoreSubmissionResult submitScore(SubmitScoreCommand command);

    List<Score> getTopScores(String gameType);

    Optional<Score> getUserBestScore(String userId, String gameType);

    // Game Status
    List<GameStatus> getAllGameStatuses();

    GameStatus getGameStatus(String gameType);

    void setGameStatus(String gameType, boolean enabled);

    record SubmitScoreCommand(String userId, String username, String gameType, int score, Integer attempts) {
    }

    record ScoreSubmissionResult(boolean newHighScore, String message) {
    }
}
