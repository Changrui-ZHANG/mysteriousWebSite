package com.changrui.mysterious.domain.profile.model;

import jakarta.persistence.*;

/**
 * Entity representing user privacy settings.
 * Maps to the 'profile_privacy_settings' table in the database.
 */
@Entity
@Table(name = "profile_privacy_settings")
public class PrivacySettings {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "profile_visibility", nullable = false, length = 20)
    private String profileVisibility;

    @Column(name = "show_bio", nullable = false, columnDefinition = "boolean default true")
    private boolean showBio;

    @Column(name = "show_stats", nullable = false, columnDefinition = "boolean default true")
    private boolean showStats;

    @Column(name = "show_achievements", nullable = false, columnDefinition = "boolean default true")
    private boolean showAchievements;

    @Column(name = "show_last_active", nullable = false, columnDefinition = "boolean default true")
    private boolean showLastActive;

    // Constructors
    public PrivacySettings() {
        this.profileVisibility = "public";
        this.showBio = true;
        this.showStats = true;
        this.showAchievements = true;
        this.showLastActive = true;
    }

    public PrivacySettings(String userId) {
        this();
        this.userId = userId;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProfileVisibility() {
        return profileVisibility;
    }

    public void setProfileVisibility(String profileVisibility) {
        this.profileVisibility = profileVisibility;
    }

    public boolean isShowBio() {
        return showBio;
    }

    public void setShowBio(boolean showBio) {
        this.showBio = showBio;
    }

    public boolean isShowStats() {
        return showStats;
    }

    public void setShowStats(boolean showStats) {
        this.showStats = showStats;
    }

    public boolean isShowAchievements() {
        return showAchievements;
    }

    public void setShowAchievements(boolean showAchievements) {
        this.showAchievements = showAchievements;
    }

    public boolean isShowLastActive() {
        return showLastActive;
    }

    public void setShowLastActive(boolean showLastActive) {
        this.showLastActive = showLastActive;
    }
}