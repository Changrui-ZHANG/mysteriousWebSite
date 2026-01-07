package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.suggestion.SuggestionComment;
import com.changrui.mysterious.domain.port.out.SuggestionCommentRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.SuggestionCommentEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.SuggestionCommentMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JpaSuggestionCommentRepository implements SuggestionCommentRepository {

    private final SpringDataSuggestionCommentRepository jpaRepository;
    private final SuggestionCommentMapper mapper;

    public JpaSuggestionCommentRepository(SpringDataSuggestionCommentRepository jpaRepository,
            SuggestionCommentMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<SuggestionComment> findBySuggestionId(String suggestionId) {
        return jpaRepository.findBySuggestionIdOrderByTimestampAsc(suggestionId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<SuggestionComment> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public boolean existsById(String id) {
        return jpaRepository.existsById(id);
    }

    @Override
    @NonNull
    public SuggestionComment save(@NonNull SuggestionComment comment) {
        SuggestionCommentEntity entity = mapper.toEntity(comment);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null suggestion comment");
        }
        SuggestionCommentEntity saved = jpaRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(saved));
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public long countBySuggestionId(String suggestionId) {
        return jpaRepository.countBySuggestionId(suggestionId);
    }
}
