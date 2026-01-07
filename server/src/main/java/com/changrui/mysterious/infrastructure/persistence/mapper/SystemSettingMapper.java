package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.system.SystemSetting;
import com.changrui.mysterious.infrastructure.persistence.entity.SystemSettingEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class SystemSettingMapper {

    @Nullable
    public SystemSetting toDomain(@Nullable SystemSettingEntity entity) {
        if (entity == null)
            return null;
        return SystemSetting.reconstitute(
                entity.getKey(),
                entity.getValue(),
                entity.getDescription());
    }

    @Nullable
    public SystemSettingEntity toEntity(@Nullable SystemSetting domain) {
        if (domain == null)
            return null;
        SystemSettingEntity entity = new SystemSettingEntity();
        entity.setKey(domain.getKey());
        entity.setValue(domain.getValue());
        entity.setDescription(domain.getDescription());
        return entity;
    }
}
