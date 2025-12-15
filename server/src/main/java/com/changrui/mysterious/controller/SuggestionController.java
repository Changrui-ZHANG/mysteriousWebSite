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
    public ResponseEntity<ApiResponse<List<SuggestionResponseDTO>>> getAllSuggestions() {
        List<Suggestion> suggestions = suggestionRepository.findAllByOrderByTimestampDesc();
        List<SuggestionResponseDTO> dtos = suggestions.stream()
                .map(s -> SuggestionResponseDTO.from(s, commentRepository.countBySuggestionId(s.getId())))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<SuggestionResponseDTO>>> getUserSuggestions(@PathVariable String userId) {
        List<Suggestion> suggestions = suggestionRepository.findByUserIdOrderByTimestampDesc(userId);
        List<SuggestionResponseDTO> dtos = suggestions.stream()
                .map(s -> SuggestionResponseDTO.from(s, commentRepository.countBySuggestionId(s.getId())))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(dtos));
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

    @Autowired
    private com.changrui.mysterious.repository.SuggestionCommentRepository commentRepository;

    // --- Comments Endpoints ---

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<com.changrui.mysterious.model.SuggestionComment>>> getComments(
            @PathVariable String id) {
        List<com.changrui.mysterious.model.SuggestionComment> comments = commentRepository
                .findBySuggestionIdOrderByTimestampAsc(id);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<com.changrui.mysterious.model.SuggestionComment>> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentCreateDTO dto) {

        // Verify suggestion exists
        suggestionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Suggestion", id));

        com.changrui.mysterious.model.SuggestionComment comment = new com.changrui.mysterious.model.SuggestionComment(
                id,
                dto.userId(),
                dto.username(),
                dto.content().trim());

        if (dto.quotedCommentId() != null && !dto.quotedCommentId().isEmpty()) {
            commentRepository.findById(dto.quotedCommentId()).ifPresent(quoted -> {
                comment.setQuotedCommentId(quoted.getId());
                comment.setQuotedUsername(quoted.getUsername());
                comment.setQuotedContent(quoted.getContent());
            });
        }

        commentRepository.save(comment);

        return ResponseEntity.ok(ApiResponse.success("Comment added successfully", comment));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable String commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new EntityNotFoundException("Comment", commentId);
        }
        commentRepository.deleteById(commentId);
        return ResponseEntity.ok(ApiResponse.successMessage("Comment deleted successfully"));
    }
}
