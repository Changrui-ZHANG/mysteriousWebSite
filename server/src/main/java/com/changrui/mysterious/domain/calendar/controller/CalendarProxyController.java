package com.changrui.mysterious.domain.calendar.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

/**
 * Proxy controller for external calendar APIs to avoid CORS issues.
 */
@RestController
@RequestMapping("/api/calendar/proxy")
public class CalendarProxyController {

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Proxies public holidays from calendrier.api.gouv.fr.
     * 
     * @param year The year to fetch.
     * @return The holidays for the year.
     */
    @GetMapping("/holidays/{year}")
    public ResponseEntity<String> getPublicHolidays(@PathVariable int year) {
        String url = String.format("https://calendrier.api.gouv.fr/jours-feries/metropole/%d.json", year);
        try {
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("{\"error\": \"Failed to fetch public holidays: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Proxies school holidays from data.education.gouv.fr.
     * 
     * @param schoolYear The school year (e.g., "2024-2025").
     * @return The school holidays.
     */
    @GetMapping("/school-holidays/{schoolYear}")
    public ResponseEntity<String> getSchoolHolidays(@PathVariable String schoolYear) {
        String url = String.format(
                "https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-calendrier-scolaire&q=&rows=2000&refine.annee_scolaire=%s",
                schoolYear);
        try {
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("{\"error\": \"Failed to fetch school holidays: " + e.getMessage() + "\"}");
        }
    }
}
