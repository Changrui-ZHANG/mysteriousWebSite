package com.changrui.mysterious.domain.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Entity representing calendar configuration.
 * Singleton pattern - only one global configuration exists.
 */
@Entity
@Table(name = "calendar_config")
public class CalendarConfig {

    @Id
    private String id = "global";

    @ElementCollection
    private List<String> activeZones = new ArrayList<>(Arrays.asList("Zone C"));

    private LocalDateTime lastUpdated;

    public CalendarConfig() {
        this.lastUpdated = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<String> getActiveZones() {
        return activeZones;
    }

    public void setActiveZones(List<String> activeZones) {
        this.activeZones = activeZones;
        this.lastUpdated = LocalDateTime.now();
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
