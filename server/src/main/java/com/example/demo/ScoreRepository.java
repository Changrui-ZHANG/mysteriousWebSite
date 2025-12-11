package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, String> {
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM (SELECT DISTINCT ON (user_id) * FROM scores WHERE game_type = :gameType ORDER BY user_id, score DESC) AS distinct_scores ORDER BY score DESC LIMIT 3", nativeQuery = true)
    List<Score> findTop3ByGameTypeOrderByScoreDesc(
            @org.springframework.data.repository.query.Param("gameType") String gameType);

    List<Score> findByUserIdAndGameType(String userId, String gameType);

    Score findTopByUserIdAndGameTypeOrderByScoreDesc(String userId, String gameType);
}
