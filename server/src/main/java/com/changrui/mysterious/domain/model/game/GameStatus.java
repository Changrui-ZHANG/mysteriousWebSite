package com.changrui.mysterious.domain.model.game;

public class GameStatus {

    private final String gameType;
    private boolean enabled;

    private GameStatus(String gameType, boolean enabled) {
        this.gameType = gameType;
        this.enabled = enabled;
    }

    public static GameStatus create(String gameType, boolean enabled) {
        return new GameStatus(gameType, enabled);
    }

    public static GameStatus reconstitute(String gameType, boolean enabled) {
        return new GameStatus(gameType, enabled);
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getGameType() {
        return gameType;
    }

    public boolean isEnabled() {
        return enabled;
    }
}
