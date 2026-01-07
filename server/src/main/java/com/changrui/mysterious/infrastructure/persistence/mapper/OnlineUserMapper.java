package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.presence.OnlineUser;
import com.changrui.mysterious.infrastructure.persistence.entity.OnlineUserEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class OnlineUserMapper {

    @Nullable
    public OnlineUser toDomain(@Nullable OnlineUserEntity entity) {
        if (entity == null)
            return null;
        return OnlineUser.reconstitute(entity.getUserId(), entity.getLastHeartbeat());
    }

    @Nullable
    public OnlineUserEntity toEntity(@Nullable OnlineUser domain) {
        if (domain == null)
            return null;
        OnlineUserEntity entity = new OnlineUserEntity();
        entity.setUserId(domain.getUserId());
        entity.setLastHeartbeat(domain.getLastHeartbeat());
        return entity;
    }
}
