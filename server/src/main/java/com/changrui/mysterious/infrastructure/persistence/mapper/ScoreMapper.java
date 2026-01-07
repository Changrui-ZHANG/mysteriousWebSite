package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.game.Score;
import com.changrui.mysterious.infrastructure.persistence.entity.ScoreEntity;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class ScoreMapper {

    @Nullable
    public Score toDomain(@Nullable ScoreEntity entity) {
        if (entity == null)
            return null;
        return Score.reconstitute(
                entity.getId(),
                entity.getUserId(),
                entity.getUsername(),
                entity.getGameType(),
                entity.getScore(),
                entity.getTimestamp(),
                entity.getAttempts());
    }

    @Nullable
    public ScoreEntity toEntity(@Nullable Score domain) {
        if (domain == null)
            return null;
        ScoreEntity entity = new ScoreEntity();
        if (domain.getId() != null)
            entity.setId(domain.getId());

        entity.setUserId(domain.getUserId());
        entity.setUsername(domain.getUsername());
        entity.setGameType(domain.getGameType());
        entity.setScore(domain.getScore());
        entity.setTimestamp(domain.getTimestamp());
        entity.setAttempts(domain.getAttempts());

        return entity;
    }
}
