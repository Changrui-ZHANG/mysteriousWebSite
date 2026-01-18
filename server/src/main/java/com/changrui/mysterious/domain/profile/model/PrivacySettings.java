package com.changrui.mysterious.domain.profile.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing user privacy settings.
 * Maps to the 'profile_privacy_settings' table in the database.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "profile_privacy_settings")
public class PrivacySettings {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "profile_visibility", nullable = false, length = 20)
    private String profileVisibility = "public";

    @Column(name = "show_bio", nullable = false, columnDefinition = "boolean default true")
    private boolean showBio = true;

    @Column(name = "show_stats", nullable = false, columnDefinition = "boolean default true")
    private boolean showStats = true;

    @Column(name = "show_achievements", nullable = false, columnDefinition = "boolean default true")
    private boolean showAchievements = true;

    @Column(name = "show_last_active", nullable = false, columnDefinition = "boolean default true")
    private boolean showLastActive = true;

    public PrivacySettings(String userId) {
        this.userId = userId;
    }
}