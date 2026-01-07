package com.changrui.mysterious.domain.messagewall.repository;

import com.changrui.mysterious.domain.messagewall.model.SuggestionComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for SuggestionComment entity operations.
 */
@Repository
public interface SuggestionCommentRepository extends JpaRepository<SuggestionComment, String> {

    List<SuggestionComment> findBySuggestionIdOrderByTimestampAsc(String suggestionId);

    long countBySuggestionId(String suggestionId);
}
