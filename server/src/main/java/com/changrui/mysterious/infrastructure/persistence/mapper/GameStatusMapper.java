package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.game.GameStatus;
import com.changrui.mysterious.infrastructure.persistence.entity.GameStatusEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class GameStatusMapper {

    @Nullable
    public GameStatus toDomain(@Nullable GameStatusEntity entity) {
        if (entity == null)
            return null;
        return GameStatus.reconstitute(entity.getGameType(), entity.isEnabled());
    }

    @Nullable
    public GameStatusEntity toEntity(@Nullable GameStatus domain) {
        if (domain == null)
            return null;
        GameStatusEntity entity = new GameStatusEntity();
        entity.setGameType(domain.getGameType());
        entity.setEnabled(domain.isEnabled());
        return entity;
    }
}
