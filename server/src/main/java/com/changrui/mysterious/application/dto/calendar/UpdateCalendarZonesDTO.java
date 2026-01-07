package com.changrui.mysterious.application.dto.calendar;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateCalendarZonesDTO(
                @NotEmpty List<String> zones,
                @NotNull String adminCode) {
}
