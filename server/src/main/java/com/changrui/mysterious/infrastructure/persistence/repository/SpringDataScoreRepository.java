package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.infrastructure.persistence.entity.ScoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataScoreRepository extends JpaRepository<ScoreEntity, String> {

    List<ScoreEntity> findTop50ByGameTypeOrderByScoreAsc(String gameType);

    List<ScoreEntity> findTop50ByGameTypeOrderByScoreDesc(String gameType);

    Optional<ScoreEntity> findTopByUserIdAndGameTypeOrderByScoreAsc(String userId, String gameType);

    Optional<ScoreEntity> findTopByUserIdAndGameTypeOrderByScoreDesc(String userId, String gameType);

    List<ScoreEntity> findByUserIdAndGameType(String userId, String gameType);
}
