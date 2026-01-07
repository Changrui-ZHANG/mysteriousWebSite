package com.changrui.mysterious.domain.game.repository;

import com.changrui.mysterious.domain.game.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Score entity operations.
 */
@Repository
public interface ScoreRepository extends JpaRepository<Score, String> {

    List<Score> findTop50ByGameTypeOrderByScoreDesc(String gameType);

    List<Score> findTop50ByGameTypeOrderByScoreAsc(String gameType);

    List<Score> findByUserIdAndGameType(String userId, String gameType);

    Score findTopByUserIdAndGameTypeOrderByScoreDesc(String userId, String gameType);

    Score findTopByUserIdAndGameTypeOrderByScoreAsc(String userId, String gameType);
}
