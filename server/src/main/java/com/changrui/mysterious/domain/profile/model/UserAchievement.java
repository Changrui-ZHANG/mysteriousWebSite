package com.changrui.mysterious.domain.profile.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing user achievements.
 * Maps to the 'user_achievements' table in the database.
 */
@Data
@NoArgsConstructor
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
    private LocalDateTime unlockedAt = LocalDateTime.now();

    public UserAchievement(String userId, String achievementId) {
        this.userId = userId;
        this.achievementId = achievementId;
        this.unlockedAt = LocalDateTime.now();
    }
}