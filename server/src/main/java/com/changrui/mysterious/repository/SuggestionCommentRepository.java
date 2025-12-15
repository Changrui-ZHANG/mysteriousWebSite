package com.changrui.mysterious.repository;

import com.changrui.mysterious.model.SuggestionComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SuggestionCommentRepository extends JpaRepository<SuggestionComment, String> {
    List<SuggestionComment> findBySuggestionIdOrderByTimestampAsc(String suggestionId);

    long countBySuggestionId(String suggestionId);
}
