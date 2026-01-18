package com.changrui.mysterious.domain.profile.service;

import com.changrui.mysterious.domain.profile.model.*;
import com.changrui.mysterious.domain.profile.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing user activity statistics and achievements.
 */
@Service
public class ActivityService {

    @Autowired
    private ActivityStatsRepository activityRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Record message activity for user
     */
    @Transactional
    public void recordMessageActivity(String userId) {
        ActivityStats stats = activityRepository.findByUserId(userId)
            .orElse(new ActivityStats(userId));
        
        stats.incrementMessages();
        activityRepository.save(stats);
        
        // Check for new achievements
        checkAndUnlockAchievements(userId, stats);
    }

    /**
     * Record game activity for user
     */
    @Transactional
    public void recordGameActivity(String userId, String gameType, int score) {
        ActivityStats stats = activityRepository.findByUserId(userId)
            .orElse(new ActivityStats(userId));
        
        stats.incrementGamesPlayed();
        
        // Update best scores
        updateBestScore(stats, gameType, score);
        
        activityRepository.save(stats);
        
        // Check for new achievements
        checkAndUnlockAchievements(userId, stats);
    }

    /**
     * Get activity statistics for user
     */
    public ActivityStats getActivityStats(String userId) {
        return activityRepository.findByUserId(userId)
            .orElse(new ActivityStats(userId));
    }

    /**
     * Get user achievements
     */
    public List<UserAchievement> getUserAchievements(String userId) {
        return userAchievementRepository.findByUserId(userId);
    }

    /**
     * Check and unlock new achievements for user
     */
    @Transactional
    public void checkAndUnlockAchievements(String userId, ActivityStats stats) {
        List<Achievement> allAchievements = achievementRepository.findAll();
        
        for (Achievement achievement : allAchievements) {
            // Skip if user already has this achievement
            if (userAchievementRepository.existsByUserIdAndAchievementId(userId, achievement.getId())) {
                continue;
            }
            
            // Check if user qualifies for this achievement
            if (qualifiesForAchievement(stats, achievement)) {
                UserAchievement userAchievement = new UserAchievement(userId, achievement.getId());
                userAchievementRepository.save(userAchievement);
            }
        }
    }

    /**
     * Check if user qualifies for an achievement
     */
    private boolean qualifiesForAchievement(ActivityStats stats, Achievement achievement) {
        if (achievement.getThresholdValue() == null) {
            return false;
        }
        
        return switch (achievement.getCategory()) {
            case "messaging" -> stats.getTotalMessages() >= achievement.getThresholdValue();
            case "gaming" -> stats.getTotalGamesPlayed() >= achievement.getThresholdValue();
            case "time" -> stats.getTimeSpent() >= achievement.getThresholdValue();
            case "social" -> stats.getCurrentStreak() >= achievement.getThresholdValue();
            default -> false;
        };
    }

    /**
     * Update best score for a game type
     */
    private void updateBestScore(ActivityStats stats, String gameType, int score) {
        try {
            Map<String, Integer> bestScores = new HashMap<>();
            
            // Parse existing scores
            if (stats.getBestScores() != null && !stats.getBestScores().equals("{}")) {
                bestScores = objectMapper.readValue(stats.getBestScores(), Map.class);
            }
            
            // Update if this is a new best score
            Integer currentBest = bestScores.get(gameType);
            if (currentBest == null || score > currentBest) {
                bestScores.put(gameType, score);
                stats.setBestScores(objectMapper.writeValueAsString(bestScores));
            }
            
        } catch (JsonProcessingException e) {
            // If JSON parsing fails, create new scores map
            Map<String, Integer> bestScores = new HashMap<>();
            bestScores.put(gameType, score);
            try {
                stats.setBestScores(objectMapper.writeValueAsString(bestScores));
            } catch (JsonProcessingException ex) {
                // Fallback to empty JSON
                stats.setBestScores("{}");
            }
        }
    }

    /**
     * Initialize default achievements on startup
     */
    @PostConstruct
    public void init() {
        initializeDefaultAchievements();
    }

    /**
     * Initialize default achievements
     */
    @Transactional
    public void initializeDefaultAchievements() {
        if (achievementRepository.count() > 0) {
            return; // Already initialized
        }

        // Messaging achievements
        Achievement firstMessage = new Achievement("first-message", "First Message", "Send your first message", "messaging", 1);
        Achievement chatty = new Achievement("chatty", "Chatty", "Send 10 messages", "messaging", 10);
        Achievement talkative = new Achievement("talkative", "Talkative", "Send 50 messages", "messaging", 50);
        Achievement conversationalist = new Achievement("conversationalist", "Conversationalist", "Send 100 messages", "messaging", 100);

        // Gaming achievements
        Achievement firstGame = new Achievement("first-game", "First Game", "Play your first game", "gaming", 1);
        Achievement gamer = new Achievement("gamer", "Gamer", "Play 10 games", "gaming", 10);
        Achievement dedicated = new Achievement("dedicated", "Dedicated Player", "Play 50 games", "gaming", 50);
        Achievement champion = new Achievement("champion", "Champion", "Play 100 games", "gaming", 100);

        // Social achievements
        Achievement socialite = new Achievement("socialite", "Socialite", "Maintain a 7-day streak", "social", 7);
        Achievement regular = new Achievement("regular", "Regular", "Maintain a 30-day streak", "social", 30);

        // Time achievements
        Achievement timeSpent1 = new Achievement("time-1h", "Hour Well Spent", "Spend 1 hour in the app", "time", 60);
        Achievement timeSpent10 = new Achievement("time-10h", "Dedicated User", "Spend 10 hours in the app", "time", 600);

        achievementRepository.saveAll(List.of(
            firstMessage, chatty, talkative, conversationalist,
            firstGame, gamer, dedicated, champion,
            socialite, regular,
            timeSpent1, timeSpent10
        ));
    }
}