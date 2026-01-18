package com.changrui.mysterious.domain.calendar.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing calendar configuration.
 * Singleton pattern - only one global configuration exists.
 * Maps to the 'calendar_config' table in the database.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "calendar_config")
public class CalendarConfig {

    @Id
    private String id = "global";

    @ElementCollection
    private List<String> activeZones = new ArrayList<>(Arrays.asList("Zone C"));

    private LocalDateTime lastUpdated = LocalDateTime.now();

    // Custom setter to update lastUpdated
    public void setActiveZones(List<String> activeZones) {
        this.activeZones = activeZones;
        this.lastUpdated = LocalDateTime.now();
    }
}
