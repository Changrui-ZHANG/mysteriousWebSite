package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.dto.common.ApiResponse;
import com.changrui.mysterious.domain.port.in.UserUseCases;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserUseCases userUseCases;

    public UserController(UserUseCases userUseCases) {
        this.userUseCases = userUseCases;
    }

    @GetMapping("/{userId}/language")
    public ResponseEntity<Map<String, String>> getLanguage(@PathVariable String userId) {
        String lang = userUseCases.getPreferredLanguage(userId);
        return ResponseEntity.ok(Map.of("language", lang));
    }

    @PutMapping("/{userId}/language")
    public ResponseEntity<ApiResponse<Void>> updateLanguage(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {

        String lang = body.get("language");
        userUseCases.updatePreferredLanguage(userId, lang);

        return ResponseEntity.ok(ApiResponse.successMessage("Language updated"));
    }
}
