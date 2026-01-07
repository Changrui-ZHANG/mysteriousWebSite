package com.changrui.mysterious.domain.model.calendar;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CalendarConfig {

    private final String id;
    private List<String> activeZones;
    private LocalDateTime lastUpdated;

    private CalendarConfig(String id, List<String> activeZones, LocalDateTime lastUpdated) {
        this.id = id;
        this.activeZones = new ArrayList<>(activeZones);
        this.lastUpdated = lastUpdated;
    }

    public static CalendarConfig createDefault() {
        return new CalendarConfig("global", List.of("Zone C"), LocalDateTime.now());
    }

    public static CalendarConfig reconstitute(String id, List<String> activeZones, LocalDateTime lastUpdated) {
        return new CalendarConfig(id, activeZones, lastUpdated);
    }

    public void updateZones(List<String> zones) {
        this.activeZones = new ArrayList<>(zones);
        this.lastUpdated = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public List<String> getActiveZones() {
        return new ArrayList<>(activeZones);
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
}
