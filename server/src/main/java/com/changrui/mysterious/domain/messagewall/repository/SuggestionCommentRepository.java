package com.changrui.mysterious.domain.messagewall.repository;

import com.changrui.mysterious.domain.messagewall.model.SuggestionComment;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for SuggestionComment entity operations.
 */
@Repository
public interface SuggestionCommentRepository extends JpaRepository<SuggestionComment, String> {

    List<SuggestionComment> findBySuggestionIdOrderByTimestampAsc(String suggestionId);

    long countBySuggestionId(String suggestionId);

    /**
     * Comment counts per suggestion as [suggestionId, count] rows.
     */
    @Query("SELECT c.suggestionId, COUNT(c) FROM SuggestionComment c WHERE c.suggestionId IN :ids GROUP BY c.suggestionId")
    List<Object[]> countBySuggestionIds(@Param("ids") Collection<String> ids);
}
