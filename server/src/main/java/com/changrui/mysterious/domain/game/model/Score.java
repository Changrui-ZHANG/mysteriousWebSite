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

    // Custom constructors can be kept if needed for specific logic,
    // otherwise @AllArgsConstructor covers the full case.
    // Keeping this partial constructor for backward compatibility if used.
    public Score(String username, String userId, String gameType, int score, long timestamp) {
        this(null, username, userId, gameType, score, timestamp, 0);
    }
}