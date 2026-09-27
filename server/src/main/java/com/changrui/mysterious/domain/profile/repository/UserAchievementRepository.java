package com.changrui.mysterious.domain.profile.repository;

import com.changrui.mysterious.domain.profile.model.UserAchievement;
import com.changrui.mysterious.domain.profile.model.UserAchievementId;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for UserAchievement entity operations.
 */
@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, UserAchievementId> {

    /**
     * Find all achievements for a user
     */
    List<UserAchievement> findByUserId(String userId);

    /**
     * Find achievements for a user with achievement details
     */
    @Query("SELECT ua FROM UserAchievement ua JOIN Achievement a ON ua.achievementId = a.id WHERE ua.userId = :userId ORDER BY ua.unlockedAt DESC")
    List<UserAchievement> findByUserIdWithAchievements(@Param("userId") String userId);

    /**
     * Check if user has specific achievement
     */
    boolean existsByUserIdAndAchievementId(String userId, String achievementId);

    /**
     * Count achievements for user
     */
    long countByUserId(String userId);

    /**
     * Find achievements for several users at once
     */
    List<UserAchievement> findByUserIdIn(Collection<String> userIds);

    /**
     * Delete all achievements of a user
     */
    @Modifying
    @Query("DELETE FROM UserAchievement ua WHERE ua.userId = :userId")
    void deleteByUserId(@Param("userId") String userId);
}