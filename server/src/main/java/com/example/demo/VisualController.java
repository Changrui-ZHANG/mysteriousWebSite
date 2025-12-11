package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.Map;
import java.util.HashMap;

@RestController
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost", "http://localhost:3001",
        "http://changrui.freeboxos.fr:3001", "http://changrui.freeboxos.fr", "http://changrui.freeboxos.fr:5173" })
public class VisualController {

    @GetMapping("/api/status")
    public Map<String, String> getStatus() {
        HashMap<String, String> map = new HashMap<>();
        map.put("status", "Backend is running beautifully!");
        map.put("effect", "Magnificent");
        return map;
    }
}
