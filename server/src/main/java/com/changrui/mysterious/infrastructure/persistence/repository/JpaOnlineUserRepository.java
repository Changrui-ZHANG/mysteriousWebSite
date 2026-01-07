package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.presence.OnlineUser;
import com.changrui.mysterious.domain.port.out.OnlineUserRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.OnlineUserEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.OnlineUserMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

@Component
public class JpaOnlineUserRepository implements OnlineUserRepository {

    private final SpringDataOnlineUserRepository jpaRepository;
    private final OnlineUserMapper mapper;

    public JpaOnlineUserRepository(SpringDataOnlineUserRepository jpaRepository, OnlineUserMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<OnlineUser> findById(String userId) {
        return jpaRepository.findById(userId).map(mapper::toDomain);
    }

    @Override
    @NonNull
    public OnlineUser save(@NonNull OnlineUser user) {
        OnlineUserEntity entity = mapper.toEntity(user);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null online user");
        }
        OnlineUserEntity saved = jpaRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(saved));
    }

    @Override
    public long countActiveUsers(LocalDateTime threshold) {
        return jpaRepository.countActiveUsers(threshold);
    }

    @Override
    public void deleteInactiveUsers(LocalDateTime threshold) {
        jpaRepository.deleteInactiveUsers(threshold);
    }
}
