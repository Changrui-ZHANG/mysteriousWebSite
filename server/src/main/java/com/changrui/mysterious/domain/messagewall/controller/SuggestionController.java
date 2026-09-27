package com.changrui.mysterious.domain.messagewall.controller;

import com.changrui.mysterious.domain.messagewall.dto.*;
import com.changrui.mysterious.domain.messagewall.model.Suggestion;
import com.changrui.mysterious.domain.messagewall.model.SuggestionComment;
import com.changrui.mysterious.domain.messagewall.service.SuggestionService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.security.CurrentUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing user suggestions.
 */
@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    @Autowired
    private SuggestionService suggestionService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SuggestionResponseDTO>>> getAllSuggestions() {
        return ResponseEntity.ok(ApiResponse.success(suggestionService.getAllSuggestions()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<SuggestionResponseDTO>>> getUserSuggestions(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(suggestionService.getUserSuggestions(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Suggestion>> submitSuggestion(@Valid @RequestBody SuggestionCreateDTO dto) {
        currentUser.requireSelf(dto.userId());
        Suggestion suggestion = suggestionService.createSuggestion(dto);
        return ResponseEntity.ok(ApiResponse.success("Suggestion submitted successfully", suggestion));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody SuggestionUpdateDTO dto,
            @RequestParam(required = false) String adminCode) {
        adminService.validateAdminCode(adminCode);
        suggestionService.updateStatus(id, dto.status());
        return ResponseEntity.ok(ApiResponse.successMessage("Status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSuggestion(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String adminCode) {
        currentUser.requireSelfOrAdmin(userId, adminCode);
        suggestionService.deleteSuggestion(id, userId, adminService.isValidAdminCode(adminCode));
        return ResponseEntity.ok(ApiResponse.successMessage("Suggestion deleted successfully"));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<SuggestionComment>>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(suggestionService.getComments(id)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<SuggestionComment>> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentCreateDTO dto) {
        currentUser.requireSelf(dto.userId());
        SuggestionComment comment = suggestionService.addComment(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Comment added successfully", comment));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable String commentId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String adminCode) {
        currentUser.requireSelfOrAdmin(userId, adminCode);
        suggestionService.deleteComment(commentId, userId, adminService.isValidAdminCode(adminCode));
        return ResponseEntity.ok(ApiResponse.successMessage("Comment deleted successfully"));
    }
}
