package com.changrui.mysterious.domain.profile.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing user activity statistics.
 * Maps to the 'user_activity_stats' table in the database.
 */
@Entity
@Table(name = "user_activity_stats")
public class ActivityStats {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "total_messages", nullable = false, columnDefinition = "integer default 0")
    private int totalMessages;

    @Column(name = "total_games_played", nullable = false, columnDefinition = "integer default 0")
    private int totalGamesPlayed;

    @Column(name = "best_scores", columnDefinition = "TEXT")
    private String bestScores; // JSON string

    @Column(name = "current_streak", nullable = false, columnDefinition = "integer default 0")
    private int currentStreak;

    @Column(name = "longest_streak", nullable = false, columnDefinition = "integer default 0")
    private int longestStreak;

    @Column(name = "time_spent", nullable = false, columnDefinition = "integer default 0")
    private int timeSpent; // in minutes

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    // Constructors
    public ActivityStats() {
        this.totalMessages = 0;
        this.totalGamesPlayed = 0;
        this.bestScores = "{}";
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.timeSpent = 0;
        this.lastUpdated = LocalDateTime.now();
    }

    public ActivityStats(String userId) {
        this();
        this.userId = userId;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getTotalMessages() {
        return totalMessages;
    }

    public void setTotalMessages(int totalMessages) {
        this.totalMessages = totalMessages;
    }

    public int getTotalGamesPlayed() {
        return totalGamesPlayed;
    }

    public void setTotalGamesPlayed(int totalGamesPlayed) {
        this.totalGamesPlayed = totalGamesPlayed;
    }

    public String getBestScores() {
        return bestScores;
    }

    public void setBestScores(String bestScores) {
        this.bestScores = bestScores;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(int longestStreak) {
        this.longestStreak = longestStreak;
    }

    public int getTimeSpent() {
        return timeSpent;
    }

    public void setTimeSpent(int timeSpent) {
        this.timeSpent = timeSpent;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
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