package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.suggestion.Suggestion;
import com.changrui.mysterious.domain.port.out.SuggestionRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.SuggestionEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.SuggestionMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JpaSuggestionRepository implements SuggestionRepository {

    private final SpringDataSuggestionRepository jpaRepository;
    private final SuggestionMapper mapper;

    public JpaSuggestionRepository(SpringDataSuggestionRepository jpaRepository, SuggestionMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Suggestion> findAll() {
        return jpaRepository.findAllByOrderByTimestampDesc().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Suggestion> findByUserId(String userId) {
        return jpaRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Suggestion> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    @NonNull
    public Suggestion save(@NonNull Suggestion suggestion) {
        SuggestionEntity entity = mapper.toEntity(suggestion);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null suggestion");
        }
        SuggestionEntity saved = jpaRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(saved));
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }
}
