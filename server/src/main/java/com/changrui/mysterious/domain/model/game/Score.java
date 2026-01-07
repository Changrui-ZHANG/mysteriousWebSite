package com.changrui.mysterious.domain.model.game;

public class Score {

    private final String id;
    private final String userId;
    private final String username;
    private final String gameType; // 'brick', 'match3', 'pokemon', 'maze'
    private final int score;
    private final long timestamp;
    private final Integer attempts; // Optional

    private Score(String id, String userId, String username, String gameType, int score, long timestamp,
            Integer attempts) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.gameType = gameType;
        this.score = score;
        this.timestamp = timestamp;
        this.attempts = attempts;
    }

    public static Score create(String userId, String username, String gameType, int score, Integer attempts) {
        return new Score(null, userId, username, gameType, score, System.currentTimeMillis(), attempts);
    }

    public static Score reconstitute(String id, String userId, String username, String gameType, int score,
            long timestamp, Integer attempts) {
        return new Score(id, userId, username, gameType, score, timestamp, attempts);
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getGameType() {
        return gameType;
    }

    public int getScore() {
        return score;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public Integer getAttempts() {
        return attempts;
    }
}
