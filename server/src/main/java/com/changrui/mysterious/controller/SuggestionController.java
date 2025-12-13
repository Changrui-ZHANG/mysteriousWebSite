package com.changrui.mysterious.controller;

import com.changrui.mysterious.model.Suggestion;
import com.changrui.mysterious.repository.SuggestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost", "http://localhost:3001",
        "http://changrui.freeboxos.fr:3001", "http://changrui.freeboxos.fr", "http://changrui.freeboxos.fr:5173" })
@RequestMapping("/api/suggestions")
public class SuggestionController {

    @Autowired
    private SuggestionRepository suggestionRepository;

    // Get all suggestions (admin only - frontend will filter)
    @GetMapping
    public ResponseEntity<List<Suggestion>> getAllSuggestions() {
        List<Suggestion> suggestions = suggestionRepository.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(suggestions);
    }

    // Get user's own suggestions
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Suggestion>> getUserSuggestions(@PathVariable String userId) {
        List<Suggestion> suggestions = suggestionRepository.findByUserIdOrderByTimestampDesc(userId);
        return ResponseEntity.ok(suggestions);
    }

    // Submit new suggestion
    @PostMapping
    public ResponseEntity<?> submitSuggestion(@RequestBody Map<String, String> body) {
        try {
            String userId = body.get("userId");
            String username = body.get("username");
            String suggestionText = body.get("suggestion");

            if (userId == null || username == null || suggestionText == null || suggestionText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
            }

            if (suggestionText.length() > 1000) {
                return ResponseEntity.badRequest().body(Map.of("message", "Suggestion too long (max 1000 characters)"));
            }

            Suggestion suggestion = new Suggestion(userId, username, suggestionText.trim());
            suggestionRepository.save(suggestion);

            return ResponseEntity.ok(Map.of("message", "Suggestion submitted successfully", "suggestion", suggestion));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error submitting suggestion: " + e.getMessage()));
        }
    }

    // Update suggestion status (admin only - frontend will check)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            if (status == null
                    || (!status.equals("pending") && !status.equals("reviewed") && !status.equals("implemented"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid status"));
            }

            Suggestion suggestion = suggestionRepository.findById(id).orElse(null);
            if (suggestion == null) {
                return ResponseEntity.notFound().build();
            }

            suggestion.setStatus(status);
            suggestionRepository.save(suggestion);

            return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error updating status: " + e.getMessage()));
        }
    }

    // Delete suggestion (admin or owner)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSuggestion(@PathVariable String id, @RequestParam String userId) {
        try {
            Suggestion suggestion = suggestionRepository.findById(id).orElse(null);
            if (suggestion == null) {
                return ResponseEntity.notFound().build();
            }

            // Frontend should check if user is admin or owner before calling this
            suggestionRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Suggestion deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error deleting suggestion: " + e.getMessage()));
        }
    }
}
