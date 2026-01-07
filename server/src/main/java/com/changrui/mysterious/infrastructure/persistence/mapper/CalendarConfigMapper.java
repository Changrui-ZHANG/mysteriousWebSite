package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.calendar.CalendarConfig;
import com.changrui.mysterious.infrastructure.persistence.entity.CalendarConfigEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class CalendarConfigMapper {

    @Nullable
    public CalendarConfig toDomain(@Nullable CalendarConfigEntity entity) {
        if (entity == null)
            return null;
        return CalendarConfig.reconstitute(
                entity.getId(),
                entity.getActiveZones(),
                entity.getLastUpdated());
    }

    @Nullable
    public CalendarConfigEntity toEntity(@Nullable CalendarConfig domain) {
        if (domain == null)
            return null;
        CalendarConfigEntity entity = new CalendarConfigEntity();
        entity.setId(domain.getId());
        entity.setActiveZones(domain.getActiveZones());
        entity.setLastUpdated(domain.getLastUpdated());
        return entity;
    }
}
