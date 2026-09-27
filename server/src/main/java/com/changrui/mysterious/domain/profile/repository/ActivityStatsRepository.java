package com.changrui.mysterious.domain.profile.repository;

import com.changrui.mysterious.domain.profile.model.ActivityStats;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
     * Find activity stats with a row lock, serializing concurrent counter updates
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ActivityStats s WHERE s.userId = :userId")
    Optional<ActivityStats> findByUserIdForUpdate(@Param("userId") String userId);

    /**
     * Check if activity stats exist for user
     */
    boolean existsByUserId(String userId);

    /**
     * Find rows for several users at once
     */
    List<ActivityStats> findByUserIdIn(Collection<String> userIds);
}