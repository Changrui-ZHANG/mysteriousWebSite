package com.changrui.mysterious.domain.profile.service;

import com.changrui.mysterious.domain.messagewall.model.Message;
import com.changrui.mysterious.domain.messagewall.repository.MessageRepository;
import com.changrui.mysterious.domain.game.model.Score;
import com.changrui.mysterious.domain.game.repository.ScoreRepository;
import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.model.PrivacySettings;
import com.changrui.mysterious.domain.profile.model.ActivityStats;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import com.changrui.mysterious.domain.profile.repository.PrivacySettingsRepository;
import com.changrui.mysterious.domain.profile.repository.ActivityStatsRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for migrating existing data to the profile system.
 * Creates profiles for existing users based on their messages and game scores.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileMigrationService {

    private final MessageRepository messageRepository;
    private final ScoreRepository scoreRepository;
    private final UserProfileRepository profileRepository;
    private final PrivacySettingsRepository privacyRepository;
    private final ActivityStatsRepository activityRepository;

    /**
     * Run migration on startup
     */
    @PostConstruct
    public void init() {
        try {
            migrateExistingUsers();
        } catch (Exception e) {
            log.error("Error during profile migration: ", e);
        }
    }

    /**
     * Migrate existing users from messages and scores to profiles
     */
    @Transactional
    public void migrateExistingUsers() {
        log.info("Starting profile migration for existing users...");

        // Get all unique users from messages
        List<Message> allMessages = messageRepository.findAll();
        Map<String, String> userIdToName = new HashMap<>();
        Map<String, Integer> userMessageCounts = new HashMap<>();

        for (Message message : allMessages) {
            if (message.getUserId() != null && !message.getUserId().isEmpty()) {
                userIdToName.put(message.getUserId(), message.getName());
                userMessageCounts.merge(message.getUserId(), 1, Integer::sum);
            }
        }

        // Get all unique users from scores
        List<Score> allScores = scoreRepository.findAll();
        Map<String, Integer> userGameCounts = new HashMap<>();

        for (Score score : allScores) {
            if (score.getUserId() != null && !score.getUserId().isEmpty()) {
                userIdToName.putIfAbsent(score.getUserId(), score.getUsername());
                userGameCounts.merge(score.getUserId(), 1, Integer::sum);
            }
        }

        log.info("Found {} unique users to migrate", userIdToName.size());

        int profilesCreated = 0;
        int profilesUpdated = 0;

        for (Map.Entry<String, String> entry : userIdToName.entrySet()) {
            String userId = entry.getKey();
            String displayName = entry.getValue();

            try {
                boolean isNewProfile = migrateUser(userId, displayName,
                        userMessageCounts.getOrDefault(userId, 0),
                        userGameCounts.getOrDefault(userId, 0));

                if (isNewProfile) {
                    profilesCreated++;
                } else {
                    profilesUpdated++;
                }
            } catch (Exception e) {
                log.error("Error migrating user {}: ", userId, e);
            }
        }

        log.info("Profile migration completed. Created: {}, Updated: {}", profilesCreated, profilesUpdated);
    }

    /**
     * Migrate a single user
     */
    private boolean migrateUser(String userId, String displayName, int messageCount, int gameCount) {
        // Check if profile already exists
        Optional<UserProfile> existingProfile = profileRepository.findByUserId(userId);

        if (existingProfile.isPresent()) {
            // Update existing profile's activity stats
            updateActivityStats(userId, messageCount, gameCount);
            return false; // Not a new profile
        }

        // Create new profile
        UserProfile profile = new UserProfile(userId, displayName);
        profile = profileRepository.save(profile);

        // Create privacy settings
        PrivacySettings privacy = new PrivacySettings(userId);
        privacyRepository.save(privacy);

        // Create activity stats
        ActivityStats stats = new ActivityStats(userId);
        stats.setTotalMessages(messageCount);
        stats.setTotalGamesPlayed(gameCount);
        activityRepository.save(stats);

        log.debug("Created profile for user: {} (messages: {}, games: {})", userId, messageCount, gameCount);
        return true; // New profile created
    }

    /**
     * Update activity stats for existing profile
     */
    private void updateActivityStats(String userId, int messageCount, int gameCount) {
        Optional<ActivityStats> existingStats = activityRepository.findByUserId(userId);

        if (existingStats.isPresent()) {
            ActivityStats stats = existingStats.get();
            // Only update if the migrated counts are higher (avoid overwriting newer data)
            if (messageCount > stats.getTotalMessages()) {
                stats.setTotalMessages(messageCount);
            }
            if (gameCount > stats.getTotalGamesPlayed()) {
                stats.setTotalGamesPlayed(gameCount);
            }
            activityRepository.save(stats);
        } else {
            // Create new stats if they don't exist
            ActivityStats stats = new ActivityStats(userId);
            stats.setTotalMessages(messageCount);
            stats.setTotalGamesPlayed(gameCount);
            activityRepository.save(stats);
        }
    }

    /**
     * Manual migration trigger (for admin use)
     */
    @Transactional
    public void forceMigration() {
        log.info("Force migration triggered by admin");
        migrateExistingUsers();
    }
}