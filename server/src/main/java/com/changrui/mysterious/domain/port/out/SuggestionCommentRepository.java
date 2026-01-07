package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.suggestion.SuggestionComment;
import java.util.List;
import java.util.Optional;

public interface SuggestionCommentRepository {
    List<SuggestionComment> findBySuggestionId(String suggestionId);

    Optional<SuggestionComment> findById(String id);

    boolean existsById(String id);

    SuggestionComment save(SuggestionComment comment);

    void deleteById(String id);

    long countBySuggestionId(String suggestionId);
}
