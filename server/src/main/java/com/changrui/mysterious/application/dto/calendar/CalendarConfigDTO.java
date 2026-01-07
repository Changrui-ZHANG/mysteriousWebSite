package com.changrui.mysterious.application.dto.calendar;

import java.time.LocalDateTime;
import java.util.List;

public record CalendarConfigDTO(
        List<String> activeZones,
        LocalDateTime lastUpdated) {
}
