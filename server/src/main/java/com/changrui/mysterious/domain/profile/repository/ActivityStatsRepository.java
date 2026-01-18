package com.changrui.mysterious.domain.profile.repository;

import com.changrui.mysterious.domain.profile.model.ActivityStats;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for ActivityStats entity operations.
 */
@Repository
public interface ActivityStatsRepository extends JpaRepository<ActivityStats, String> {

    /**
     * Find activity stats by user ID
     */
    Optional<ActivityStats> findByUserId(String userId);

    /**
     * Check if activity stats exist for user
     */
    boolean existsByUserId(String userId);
}