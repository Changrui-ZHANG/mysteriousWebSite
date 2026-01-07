package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.game.Score;
import com.changrui.mysterious.domain.port.out.ScoreRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.ScoreEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.ScoreMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JpaScoreRepository implements ScoreRepository {

    private final SpringDataScoreRepository jpaRepository;
    private final ScoreMapper mapper;

    public JpaScoreRepository(SpringDataScoreRepository jpaRepository, ScoreMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    @NonNull
    public Score save(@NonNull Score score) {
        ScoreEntity entity = mapper.toEntity(score);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null score");
        }
        ScoreEntity saved = jpaRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(saved));
    }

    @Override
    public List<Score> findTopScoresAsc(String gameType, int limit) {
        // Limit handled by repository method name (findTop50)
        // Just return mapped domain objects
        return jpaRepository.findTop50ByGameTypeOrderByScoreAsc(gameType)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Score> findTopScoresDesc(String gameType, int limit) {
        return jpaRepository.findTop50ByGameTypeOrderByScoreDesc(gameType)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Score> findUserBestScoreAsc(String userId, String gameType) {
        return jpaRepository.findTopByUserIdAndGameTypeOrderByScoreAsc(userId, gameType)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Score> findUserBestScoreDesc(String userId, String gameType) {
        return jpaRepository.findTopByUserIdAndGameTypeOrderByScoreDesc(userId, gameType)
                .map(mapper::toDomain);
    }

    @Override
    public List<Score> findByUserIdAndGameType(String userId, String gameType) {
        return jpaRepository.findByUserIdAndGameType(userId, gameType)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
