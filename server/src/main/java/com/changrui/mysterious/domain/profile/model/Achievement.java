package com.changrui.mysterious.domain.profile.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing system achievements.
 * Maps to the 'achievements' table in the database.
 */
@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    private String id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "category", nullable = false, length = 20)
    private String category;

    @Column(name = "threshold_value")
    private Integer thresholdValue;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Achievement() {
        this.createdAt = LocalDateTime.now();
    }

    public Achievement(String id, String name, String description, String category, Integer thresholdValue) {
        this();
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.thresholdValue = thresholdValue;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIconUrl() {
        return iconUrl;
    }

    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getThresholdValue() {
        return thresholdValue;
    }

    public void setThresholdValue(Integer thresholdValue) {
        this.thresholdValue = thresholdValue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}