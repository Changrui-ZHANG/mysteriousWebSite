package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.user.User;
import com.changrui.mysterious.domain.model.user.UserId;
import com.changrui.mysterious.domain.port.out.UserRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.AppUserEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.UserMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adapter implémentant le port UserRepository du domaine.
 * Fait le pont entre le domaine et Spring Data JPA.
 */
@Component
public class JpaUserRepository implements UserRepository {

    private final SpringDataUserRepository springDataRepository;
    private final UserMapper mapper;

    public JpaUserRepository(SpringDataUserRepository springDataRepository, UserMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<User> findById(UserId id) {
        return springDataRepository.findById(id.value())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return springDataRepository.findByUsername(username)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByUsername(String username) {
        return springDataRepository.existsByUsername(username);
    }

    @Override
    @NonNull
    public User save(@NonNull User user) {
        AppUserEntity entity = mapper.toEntity(user);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null user");
        }
        AppUserEntity savedEntity = springDataRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(savedEntity));
    }

    @Override
    public void deleteById(UserId id) {
        springDataRepository.deleteById(id.value());
    }

    @Override
    public List<User> findAll() {
        return springDataRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
