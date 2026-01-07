package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.game.GameStatus;
import com.changrui.mysterious.domain.port.out.GameStatusRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.GameStatusEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.GameStatusMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Optional;

@Component
public class JpaGameStatusRepository implements GameStatusRepository {

    private final SpringDataGameStatusRepository jpaRepository;
    private final GameStatusMapper mapper;

    public JpaGameStatusRepository(SpringDataGameStatusRepository jpaRepository, GameStatusMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<GameStatus> findByGameType(String gameType) {
        return jpaRepository.findById(gameType).map(mapper::toDomain);
    }

    @Override
    public java.util.List<GameStatus> findAll() {
        return jpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @NonNull
    public GameStatus save(@NonNull GameStatus gameStatus) {
        GameStatusEntity entity = mapper.toEntity(gameStatus);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null game status");
        }
        GameStatusEntity saved = jpaRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(saved));
    }

    @Override
    public void deleteByGameType(String gameType) {
        jpaRepository.deleteById(gameType);
    }
}
