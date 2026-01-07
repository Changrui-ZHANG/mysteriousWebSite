package com.changrui.mysterious.domain.game.model;

import jakarta.persistence.*;

/**
 * Entity representing the enabled/disabled status of a game.
 * Maps to the 'game_status' table in the database.
 */
@Entity
@Table(name = "game_status")
public class GameStatus {

    @Id
    @Column(name = "game_type")
    private String gameType;

    @Column(nullable = false)
    private boolean enabled = true;

    public GameStatus() {
    }

    public GameStatus(String gameType, boolean enabled) {
        this.gameType = gameType;
        this.enabled = enabled;
    }

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
