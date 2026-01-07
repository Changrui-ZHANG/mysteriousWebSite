package com.changrui.mysterious.domain.system.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for system status endpoint.
 */
@RestController
public class VisualController {

    @GetMapping("/api/status")
    public Map<String, String> getStatus() {
        HashMap<String, String> map = new HashMap<>();
        map.put("status", "Backend is running beautifully!");
        map.put("effect", "Magnificent");
        return map;
    }
}
