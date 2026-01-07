package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.vocabulary.VocabularyItem;
import com.changrui.mysterious.domain.port.out.VocabularyRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.VocabularyItemEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.VocabularyItemMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JpaVocabularyRepository implements VocabularyRepository {

    private final SpringDataVocabularyRepository jpaRepository;
    private final VocabularyItemMapper mapper;

    public JpaVocabularyRepository(SpringDataVocabularyRepository jpaRepository, VocabularyItemMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<VocabularyItem> findAll() {
        return jpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<VocabularyItem> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    @NonNull
    public VocabularyItem save(@NonNull VocabularyItem item) {
        VocabularyItemEntity entity = mapper.toEntity(item);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null vocabulary item");
        }
        VocabularyItemEntity saved = jpaRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(saved));
    }
}
