package com.changrui.mysterious.infrastructure.persistence.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "game_status")
public class GameStatusEntity {

    @Id
    @Column(name = "game_type")
    private String gameType; // 'brick', 'match3', 'pokemon', 'maze'

    private boolean enabled;

    public GameStatusEntity() {
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
