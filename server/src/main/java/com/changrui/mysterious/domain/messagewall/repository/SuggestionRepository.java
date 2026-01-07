package com.changrui.mysterious.domain.messagewall.repository;

import com.changrui.mysterious.domain.messagewall.model.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Suggestion entity operations.
 */
@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, String> {

    List<Suggestion> findAllByOrderByTimestampDesc();

    List<Suggestion> findByUserIdOrderByTimestampDesc(String userId);
}
