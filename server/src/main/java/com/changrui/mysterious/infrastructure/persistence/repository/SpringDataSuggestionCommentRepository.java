package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.infrastructure.persistence.entity.SuggestionCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataSuggestionCommentRepository extends JpaRepository<SuggestionCommentEntity, String> {
    List<SuggestionCommentEntity> findBySuggestionIdOrderByTimestampAsc(String suggestionId);

    long countBySuggestionId(String suggestionId);
}
