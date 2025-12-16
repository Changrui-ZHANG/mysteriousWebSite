package com.changrui.mysterious.repository;

import com.changrui.mysterious.model.VocabularyItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VocabularyRepository extends JpaRepository<VocabularyItem, Integer> {
}
