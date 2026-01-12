package com.changrui.mysterious.domain.profile.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing user achievements.
 * Maps to the 'user_achievements' table in the database.
 */
@Entity
@Table(name = "user_achievements")
@IdClass(UserAchievementId.class)
public class UserAchievement {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Id
    @Column(name = "achievement_id")
    private String achievementId;

    @Column(name = "unlocked_at", nullable = false)
    private LocalDateTime unlockedAt;

    // Constructors
    public UserAchievement() {
        this.unlockedAt = LocalDateTime.now();
    }

    public UserAchievement(String userId, String achievementId) {
        this();
        this.userId = userId;
        this.achievementId = achievementId;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAchievementId() {
        return achievementId;
    }

    public void setAchievementId(String achievementId) {
        this.achievementId = achievementId;
    }

    public LocalDateTime getUnlockedAt() {
        return unlockedAt;
    }

    public void setUnlockedAt(LocalDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }
}