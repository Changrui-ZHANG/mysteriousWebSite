package com.changrui.mysterious.domain.profile.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing user activity statistics.
 * Maps to the 'user_activity_stats' table in the database.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "user_activity_stats")
public class ActivityStats {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "total_messages", nullable = false, columnDefinition = "integer default 0")
    private int totalMessages = 0;

    @Column(name = "total_games_played", nullable = false, columnDefinition = "integer default 0")
    private int totalGamesPlayed = 0;

    @Column(name = "best_scores", columnDefinition = "TEXT")
    private String bestScores = "{}"; // JSON string

    @Column(name = "current_streak", nullable = false, columnDefinition = "integer default 0")
    private int currentStreak = 0;

    @Column(name = "longest_streak", nullable = false, columnDefinition = "integer default 0")
    private int longestStreak = 0;

    @Column(name = "time_spent", nullable = false, columnDefinition = "integer default 0")
    private int timeSpent = 0; // in minutes

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated = LocalDateTime.now();

    public ActivityStats(String userId) {
        this.userId = userId;
    }

    @PreUpdate
    public void preUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    // Helper methods
    public void incrementMessages() {
        this.totalMessages++;
        this.lastUpdated = LocalDateTime.now();
    }

    public void incrementGamesPlayed() {
        this.totalGamesPlayed++;
        this.lastUpdated = LocalDateTime.now();
    }
}