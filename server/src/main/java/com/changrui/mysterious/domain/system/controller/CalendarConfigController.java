package com.changrui.mysterious.domain.system.controller;

import com.changrui.mysterious.domain.system.model.CalendarConfig;
import com.changrui.mysterious.domain.system.service.CalendarConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for calendar configuration.
 */
@RestController
@RequestMapping("/api/calendar-config")
public class CalendarConfigController {

    @Autowired
    private CalendarConfigService service;

    @GetMapping
    public CalendarConfig getConfig() {
        return service.getConfig();
    }

    @PostMapping
    public ResponseEntity<?> updateConfig(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> zones = (List<String>) request.get("zones");
            String adminCode = (String) request.get("adminCode");

            if (zones == null || adminCode == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing zones or adminCode"));
            }

            CalendarConfig updated = service.updateZones(zones, adminCode);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
}
