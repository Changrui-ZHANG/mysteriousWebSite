package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, String> {
    List<Score> findTop3ByGameTypeOrderByScoreDesc(String gameType);
}
