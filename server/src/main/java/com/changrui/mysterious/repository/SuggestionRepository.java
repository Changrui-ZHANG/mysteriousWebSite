package com.changrui.mysterious.repository;

import com.changrui.mysterious.model.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, String> {
    List<Suggestion> findAllByOrderByTimestampDesc();

    List<Suggestion> findByUserIdOrderByTimestampDesc(String userId);
}
