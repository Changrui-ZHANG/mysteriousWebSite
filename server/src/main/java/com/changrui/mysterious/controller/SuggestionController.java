package com.changrui.mysterious.controller;

import com.changrui.mysterious.dto.common.ApiResponse;
import com.changrui.mysterious.dto.suggestion.*;
import com.changrui.mysterious.exception.EntityNotFoundException;
import com.changrui.mysterious.model.Suggestion;
import com.changrui.mysterious.repository.SuggestionRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing user suggestions
 */
@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    @Autowired
    private SuggestionRepository suggestionRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Suggestion>>> getAllSuggestions() {
        List<Suggestion> suggestions = suggestionRepository.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Suggestion>>> getUserSuggestions(@PathVariable String userId) {
        List<Suggestion> suggestions = suggestionRepository.findByUserIdOrderByTimestampDesc(userId);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Suggestion>> submitSuggestion(@Valid @RequestBody SuggestionCreateDTO dto) {
        Suggestion suggestion = new Suggestion(
                dto.userId(),
                dto.username(),
                dto.suggestion().trim());
        suggestionRepository.save(suggestion);

        return ResponseEntity.ok(ApiResponse.success("Suggestion submitted successfully", suggestion));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody SuggestionUpdateDTO dto) {

        Suggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Suggestion", id));

        suggestion.setStatus(dto.status());
        suggestionRepository.save(suggestion);

        return ResponseEntity.ok(ApiResponse.successMessage("Status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSuggestion(
            @PathVariable String id,
            @RequestParam String userId) {

        Suggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Suggestion", id));

        // Frontend should check if user is admin or owner before calling this
        suggestionRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.successMessage("Suggestion deleted successfully"));
    }
}
