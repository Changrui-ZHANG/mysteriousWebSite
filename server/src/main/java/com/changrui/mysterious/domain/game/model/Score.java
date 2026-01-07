package com.changrui.mysterious.domain.game.model;

import jakarta.persistence.*;

/**
 * Entity representing a game score.
 * Maps to the 'scores' table in the database.
 */
@Entity
@Table(name = "scores", indexes = {
        @Index(name = "idx_user_game", columnList = "user_id, game_type"),
        @Index(name = "idx_game_score", columnList = "game_type, score")
})
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String username;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "game_type", nullable = false)
    private String gameType;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private long timestamp;

    @Column(nullable = true)
    private Integer attempts;

    public Score() {
    }

    public Score(String username, String userId, String gameType, int score, long timestamp) {
        this(username, userId, gameType, score, timestamp, null);
    }

    public Score(String username, String userId, String gameType, int score, long timestamp, Integer attempts) {
        this.username = username;
        this.userId = userId;
        this.gameType = gameType;
        this.score = score;
        this.timestamp = timestamp;
        this.attempts = attempts;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getAttempts() {
        return attempts;
    }

    public void setAttempts(Integer attempts) {
        this.attempts = attempts;
    }
}
