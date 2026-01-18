package com.changrui.mysterious.domain.profile.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing system achievements.
 * Maps to the 'achievements' table in the database.
 */
@Data
@NoArgsConstructor
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
    private LocalDateTime createdAt = LocalDateTime.now();

    public Achievement(String id, String name, String description, String category, Integer thresholdValue) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.thresholdValue = thresholdValue;
        this.createdAt = LocalDateTime.now();
    }
}