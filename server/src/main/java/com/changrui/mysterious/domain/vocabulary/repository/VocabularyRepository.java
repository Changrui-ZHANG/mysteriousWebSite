package com.changrui.mysterious.domain.vocabulary.repository;

import com.changrui.mysterious.domain.vocabulary.model.VocabularyItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for VocabularyItem entity operations.
 */
@Repository
public interface VocabularyRepository extends JpaRepository<VocabularyItem, Integer> {
}
