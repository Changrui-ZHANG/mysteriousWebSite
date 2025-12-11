package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost", "http://localhost:3001" })
@RequestMapping("/api/presence")
public class OnlineUserController {

    @Autowired
    private OnlineUserService onlineUserService;

    private static final String ADMIN_CODE = "Changrui";

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        if (userId != null && !userId.isEmpty()) {
            onlineUserService.updateHeartbeat(userId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getOnlineCount() {
        long count = onlineUserService.getOnlineCount();
        boolean showToAll = onlineUserService.isShowOnlineCountToAll();

        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        response.put("showToAll", showToAll);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/toggle-visibility")
    public ResponseEntity<?> toggleVisibility(@RequestParam String adminCode) {
        if (ADMIN_CODE.equals(adminCode)) {
            onlineUserService.toggleShowOnlineCountToAll();
            Map<String, Object> response = new HashMap<>();
            response.put("showToAll", onlineUserService.isShowOnlineCountToAll());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(403).body("Invalid admin code");
    }
}
