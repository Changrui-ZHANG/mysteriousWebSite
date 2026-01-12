package com.changrui.mysterious.domain.profile.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for the profile system.
 */
@Configuration
@ConfigurationProperties(prefix = "app.profile")
public class ProfileConfig {

    private Avatar avatar = new Avatar();
    private Privacy privacy = new Privacy();

    public Avatar getAvatar() {
        return avatar;
    }

    public void setAvatar(Avatar avatar) {
        this.avatar = avatar;
    }

    public Privacy getPrivacy() {
        return privacy;
    }

    public void setPrivacy(Privacy privacy) {
        this.privacy = privacy;
    }

    public static class Avatar {
        private long maxFileSize = 5 * 1024 * 1024; // 5MB
        private int targetSize = 256; // 256x256 pixels
        private String[] allowedTypes = {"image/jpeg", "image/png", "image/webp"};
        private String uploadPath = "/uploads/avatars/";

        public long getMaxFileSize() {
            return maxFileSize;
        }

        public void setMaxFileSize(long maxFileSize) {
            this.maxFileSize = maxFileSize;
        }

        public int getTargetSize() {
            return targetSize;
        }

        public void setTargetSize(int targetSize) {
            this.targetSize = targetSize;
        }

        public String[] getAllowedTypes() {
            return allowedTypes;
        }

        public void setAllowedTypes(String[] allowedTypes) {
            this.allowedTypes = allowedTypes;
        }

        public String getUploadPath() {
            return uploadPath;
        }

        public void setUploadPath(String uploadPath) {
            this.uploadPath = uploadPath;
        }
    }

    public static class Privacy {
        private String defaultVisibility = "public";
        private boolean defaultShowBio = true;
        private boolean defaultShowStats = true;
        private boolean defaultShowAchievements = true;
        private boolean defaultShowLastActive = true;

        public String getDefaultVisibility() {
            return defaultVisibility;
        }

        public void setDefaultVisibility(String defaultVisibility) {
            this.defaultVisibility = defaultVisibility;
        }

        public boolean isDefaultShowBio() {
            return defaultShowBio;
        }

        public void setDefaultShowBio(boolean defaultShowBio) {
            this.defaultShowBio = defaultShowBio;
        }

        public boolean isDefaultShowStats() {
            return defaultShowStats;
        }

        public void setDefaultShowStats(boolean defaultShowStats) {
            this.defaultShowStats = defaultShowStats;
        }

        public boolean isDefaultShowAchievements() {
            return defaultShowAchievements;
        }

        public void setDefaultShowAchievements(boolean defaultShowAchievements) {
            this.defaultShowAchievements = defaultShowAchievements;
        }

        public boolean isDefaultShowLastActive() {
            return defaultShowLastActive;
        }

        public void setDefaultShowLastActive(boolean defaultShowLastActive) {
            this.defaultShowLastActive = defaultShowLastActive;
        }
    }
}