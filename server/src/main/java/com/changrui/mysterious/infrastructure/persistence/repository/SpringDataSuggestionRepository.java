package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.infrastructure.persistence.entity.SuggestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataSuggestionRepository extends JpaRepository<SuggestionEntity, String> {
    List<SuggestionEntity> findAllByOrderByTimestampDesc();

    List<SuggestionEntity> findByUserIdOrderByTimestampDesc(String userId);
}
