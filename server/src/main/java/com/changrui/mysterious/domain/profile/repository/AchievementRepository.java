package com.changrui.mysterious.domain.profile.repository;

import com.changrui.mysterious.domain.profile.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Achievement entity operations.
 */
@Repository
public interface AchievementRepository extends JpaRepository<Achievement, String> {

    /**
     * Find achievements by category
     */
    List<Achievement> findByCategory(String category);

    /**
     * Find achievements by category ordered by threshold
     */
    List<Achievement> findByCategoryOrderByThresholdValueAsc(String category);
}