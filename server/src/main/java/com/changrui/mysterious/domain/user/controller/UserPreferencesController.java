package com.changrui.mysterious.domain.user.controller;

import com.changrui.mysterious.domain.user.repository.AppUserRepository;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing user preferences (language, etc.).
 */
@RestController
@RequestMapping("/api/users")
public class UserPreferencesController {

    @Autowired
    private AppUserRepository userRepository;

    @GetMapping("/{userId}/language")
    public ResponseEntity<?> getLanguagePreference(@PathVariable String userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("language", user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "fr");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/language")
    public ResponseEntity<?> updateLanguagePreference(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {

        String language = request.get("language");
        if (language == null || language.isEmpty()) {
            return ResponseEntity.badRequest().body("Language is required");
        }

        if (!language.matches("^(fr|en|zh)$")) {
            return ResponseEntity.badRequest().body("Invalid language code. Must be: fr, en, or zh");
        }

        return userRepository.findById(userId)
                .map(user -> {
                    user.setPreferredLanguage(language);
                    userRepository.save(user);

                    Map<String, String> response = new HashMap<>();
                    response.put("language", language);
                    response.put("message", "Language preference updated successfully");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
