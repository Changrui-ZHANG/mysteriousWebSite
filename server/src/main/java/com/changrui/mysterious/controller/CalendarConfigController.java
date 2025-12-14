package com.changrui.mysterious.controller;

import com.changrui.mysterious.model.CalendarConfig;
import com.changrui.mysterious.service.CalendarConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar-config")
public class CalendarConfigController {

    @Autowired
    private CalendarConfigService service;

    /**
     * GET /api/calendar-config
     * Returns the current global calendar configuration
     */
    @GetMapping
    public CalendarConfig getConfig() {
        return service.getConfig();
    }

    /**
     * POST /api/calendar-config
     * Updates the active zones (admin only)
     * Body: { "zones": ["Zone A", "Zone C"], "adminCode": "..." }
     */
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
