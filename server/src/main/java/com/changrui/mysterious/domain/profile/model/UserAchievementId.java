package com.changrui.mysterious.domain.profile.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Composite key for UserAchievement entity.
 */
public class UserAchievementId implements Serializable {

    private String userId;
    private String achievementId;

    // Constructors
    public UserAchievementId() {}

    public UserAchievementId(String userId, String achievementId) {
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

    // equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserAchievementId that = (UserAchievementId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(achievementId, that.achievementId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, achievementId);
    }
}