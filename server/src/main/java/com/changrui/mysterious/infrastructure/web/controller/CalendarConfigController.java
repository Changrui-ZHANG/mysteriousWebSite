package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.dto.calendar.CalendarConfigDTO;
import com.changrui.mysterious.application.dto.calendar.UpdateCalendarZonesDTO;
import com.changrui.mysterious.domain.model.calendar.CalendarConfig;
import com.changrui.mysterious.domain.port.in.calendar.CalendarUseCases;
import com.changrui.mysterious.application.dto.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calendar-config")
public class CalendarConfigController {

    private final CalendarUseCases calendarUseCases;

    public CalendarConfigController(CalendarUseCases calendarUseCases) {
        this.calendarUseCases = calendarUseCases;
    }

    @GetMapping
    public ResponseEntity<CalendarConfigDTO> getConfig() {
        CalendarConfig config = calendarUseCases.getConfig();
        return ResponseEntity.ok(toDTO(config));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CalendarConfigDTO>> updateZones(
            @Valid @RequestBody UpdateCalendarZonesDTO dto) {

        CalendarConfig updated = calendarUseCases.updateZones(dto.zones(), dto.adminCode());
        return ResponseEntity.ok(ApiResponse.success("Calendar configuration updated", toDTO(updated)));
    }

    private CalendarConfigDTO toDTO(CalendarConfig config) {
        return new CalendarConfigDTO(config.getActiveZones(), config.getLastUpdated());
    }
}
