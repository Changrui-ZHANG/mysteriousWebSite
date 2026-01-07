package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.suggestion.Suggestion;
import java.util.List;
import java.util.Optional;

public interface SuggestionRepository {
    List<Suggestion> findAll();

    List<Suggestion> findByUserId(String userId);

    Optional<Suggestion> findById(String id);

    Suggestion save(Suggestion suggestion);

    void deleteById(String id);
}
