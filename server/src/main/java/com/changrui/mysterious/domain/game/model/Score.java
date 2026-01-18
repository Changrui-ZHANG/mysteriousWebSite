package com.changrui.mysterious.domain.game.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Entity representing a game score.
 * Maps to the 'scores' table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}