package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.calendar.CalendarConfig;
import com.changrui.mysterious.domain.port.out.CalendarConfigRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.CalendarConfigEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.CalendarConfigMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Optional;

@Component
public class JpaCalendarConfigRepository implements CalendarConfigRepository {

    private final SpringDataCalendarConfigRepository jpaRepository;
    private final CalendarConfigMapper mapper;

    public JpaCalendarConfigRepository(SpringDataCalendarConfigRepository jpaRepository, CalendarConfigMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<CalendarConfig> findGlobal() {
        return jpaRepository.findById("global").map(mapper::toDomain);
    }

    @Override
    @NonNull
    public CalendarConfig save(@NonNull CalendarConfig config) {
        CalendarConfigEntity entity = mapper.toEntity(config);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null calendar config");
        }
        CalendarConfigEntity saved = jpaRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(saved));
    }
}
