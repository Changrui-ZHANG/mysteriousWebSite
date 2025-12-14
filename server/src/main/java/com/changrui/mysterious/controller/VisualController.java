package com.changrui.mysterious.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

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
