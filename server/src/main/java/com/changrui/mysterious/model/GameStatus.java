package com.changrui.mysterious.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "game_status")
public class GameStatus {
    @Id
    private String gameType; // 'brick', 'match3', 'pokemon', 'maze'
    private boolean enabled;

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
