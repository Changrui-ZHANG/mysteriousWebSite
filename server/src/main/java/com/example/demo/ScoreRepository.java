package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, String> {
        // Basic retrievals without native query complexity
        List<Score> findTop50ByGameTypeOrderByScoreDesc(String gameType);

        List<Score> findTop50ByGameTypeOrderByScoreAsc(String gameType);

        // Personal best lookups
        List<Score> findByUserIdAndGameType(String userId, String gameType);

        Score findTopByUserIdAndGameTypeOrderByScoreDesc(String userId, String gameType);

        Score findTopByUserIdAndGameTypeOrderByScoreAsc(String userId, String gameType);
}
