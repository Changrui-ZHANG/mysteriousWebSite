package com.changrui.mysterious.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "calendar_configs")
public class CalendarConfigEntity {

    @Id
    private String id = "global";

    @ElementCollection
    @CollectionTable(name = "calendar_active_zones", joinColumns = @JoinColumn(name = "config_id"))
    @Column(name = "zone_name")
    private List<String> activeZones = new ArrayList<>();

    private LocalDateTime lastUpdated;

    public CalendarConfigEntity() {
    }

    // Getters / Setters
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
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
