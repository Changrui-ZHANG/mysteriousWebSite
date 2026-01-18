package com.changrui.mysterious.domain.messagewall.repository;

import com.changrui.mysterious.domain.messagewall.model.SuggestionComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for SuggestionComment entity operations.
 */
@Repository
public interface SuggestionCommentRepository extends JpaRepository<SuggestionComment, String> {

    List<SuggestionComment> findBySuggestionIdOrderByTimestampAsc(String suggestionId);

    long countBySuggestionId(String suggestionId);
}
