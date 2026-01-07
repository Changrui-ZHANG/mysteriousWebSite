package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.system.SystemSetting;
import com.changrui.mysterious.domain.port.out.SystemSettingRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.SystemSettingEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.SystemSettingMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JpaSystemSettingRepository implements SystemSettingRepository {

    private final SpringDataSystemSettingRepository jpaRepository;
    private final SystemSettingMapper mapper;

    public JpaSystemSettingRepository(SpringDataSystemSettingRepository jpaRepository, SystemSettingMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<SystemSetting> findAll() {
        return jpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<SystemSetting> findByKey(String key) {
        return jpaRepository.findById(key).map(mapper::toDomain);
    }

    @Override
    @NonNull
    public SystemSetting save(@NonNull SystemSetting setting) {
        SystemSettingEntity entity = mapper.toEntity(setting);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null system setting");
        }
        SystemSettingEntity saved = jpaRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(saved));
    }

    @Override
    public boolean existsByKey(String key) {
        return jpaRepository.existsById(key);
    }
}
