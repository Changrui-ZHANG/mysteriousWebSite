package com.changrui.mysterious.domain.profile.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * Entity representing a user profile.
 * Maps to the 'user_profiles' table in the database.
 */
@Data
// Not using @NoArgsConstructor because we have custom initialization in
// constructor
@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "display_name", nullable = false, length = 30)
    private String displayName;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "join_date", nullable = false)
    private LocalDateTime joinDate;

    @Column(name = "last_active", nullable = false)
    private LocalDateTime lastActive;

    @JsonProperty("isPublic")
    @Column(name = "is_public", nullable = false, columnDefinition = "boolean default true")
    private boolean isPublic;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public UserProfile() {
        this.joinDate = LocalDateTime.now();
        this.lastActive = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isPublic = true;
    }

    public UserProfile(String userId, String displayName) {
        this();
        this.userId = userId;
        this.displayName = displayName;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.lastActive = LocalDateTime.now();
    }

    /**
     * Gets the resolved avatar URL, falling back to defaults based on gender if
     * necessary.
     */
    public String getResolvedAvatarUrl() {
        if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
            if ("H".equalsIgnoreCase(gender) || "M".equalsIgnoreCase(gender) || "B".equalsIgnoreCase(gender)) {
                return "/avatars/default-B.jpeg";
            } else if ("F".equalsIgnoreCase(gender) || "G".equalsIgnoreCase(gender)) {
                return "/avatars/default-G.jpeg";
            }
            return "/avatars/default-avatar.png";
        }
        return avatarUrl;
    }
}