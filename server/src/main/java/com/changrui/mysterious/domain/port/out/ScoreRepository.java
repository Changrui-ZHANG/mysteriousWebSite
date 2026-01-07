package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.game.Score;
import java.util.List;
import java.util.Optional;

public interface ScoreRepository {
    Score save(Score score);

    List<Score> findTopScoresAsc(String gameType, int limit); // Lower is better (Maze)

    List<Score> findTopScoresDesc(String gameType, int limit); // Higher is better

    Optional<Score> findUserBestScoreAsc(String userId, String gameType);

    Optional<Score> findUserBestScoreDesc(String userId, String gameType);

    List<Score> findByUserIdAndGameType(String userId, String gameType);
}
