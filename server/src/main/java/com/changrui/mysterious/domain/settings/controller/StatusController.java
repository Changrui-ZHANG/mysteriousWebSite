package com.changrui.mysterious.domain.settings.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for API status endpoint.
 */
@RestController
public class StatusController {

    @GetMapping("/api/status")
    public Map<String, String> getStatus() {
        HashMap<String, String> map = new HashMap<>();
        map.put("status", "Backend is running beautifully!");
        map.put("effect", "Magnificent");
        return map;
    }
}
