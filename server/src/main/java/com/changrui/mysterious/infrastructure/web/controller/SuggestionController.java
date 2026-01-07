package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.dto.suggestion.*;
import com.changrui.mysterious.application.dto.common.ApiResponse;
import com.changrui.mysterious.domain.model.suggestion.Suggestion;
import com.changrui.mysterious.domain.model.suggestion.SuggestionComment;
import com.changrui.mysterious.domain.port.in.suggestion.SuggestionUseCases;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    private final SuggestionUseCases suggestionUseCases;

    public SuggestionController(SuggestionUseCases suggestionUseCases) {
        this.suggestionUseCases = suggestionUseCases;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SuggestionDTO>>> getAllSuggestions() {
        List<SuggestionDTO> dtos = suggestionUseCases.getAllSuggestions().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<SuggestionDTO>>> getUserSuggestions(@PathVariable String userId) {
        List<SuggestionDTO> dtos = suggestionUseCases.getUserSuggestions(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SuggestionDTO>> submitSuggestion(@Valid @RequestBody CreateSuggestionDTO dto) {
        Suggestion suggestion = suggestionUseCases.submitSuggestion(
                new SuggestionUseCases.SubmitSuggestionCommand(dto.userId(), dto.username(), dto.suggestion()));
        return ResponseEntity.ok(ApiResponse.success("Suggestion submitted successfully", toDTO(suggestion)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateSuggestionStatusDTO dto) {

        suggestionUseCases.updateStatus(id, dto.status());
        return ResponseEntity.ok(ApiResponse.successMessage("Status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSuggestion(
            @PathVariable String id,
            @RequestParam String userId) {
        // Validation of ownership/admin should ideally be in UseCase or Security aspect
        suggestionUseCases.deleteSuggestion(id);
        return ResponseEntity.ok(ApiResponse.successMessage("Suggestion deleted successfully"));
    }

    // --- Comments Endpoints ---

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentDTO>>> getComments(@PathVariable String id) {
        List<CommentDTO> dtos = suggestionUseCases.getComments(id).stream()
                .map(this::toCommentDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentDTO>> addComment(
            @PathVariable String id,
            @Valid @RequestBody CreateCommentDTO dto) {

        SuggestionComment comment = suggestionUseCases.addComment(id,
                new SuggestionUseCases.AddCommentCommand(dto.userId(), dto.username(), dto.content(),
                        dto.quotedCommentId()));

        return ResponseEntity.ok(ApiResponse.success("Comment added successfully", toCommentDTO(comment)));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable String commentId) {
        suggestionUseCases.deleteComment(commentId);
        return ResponseEntity.ok(ApiResponse.successMessage("Comment deleted successfully"));
    }

    // --- Mappers ---

    private SuggestionDTO toDTO(Suggestion suggestion) {
        long count = suggestionUseCases.getCommentCount(suggestion.getId());
        return new SuggestionDTO(
                suggestion.getId(),
                suggestion.getUserId(),
                suggestion.getUsername(),
                suggestion.getContent(),
                suggestion.getTimestamp(),
                suggestion.getStatus().toLowerCase(),
                count);
    }

    private CommentDTO toCommentDTO(SuggestionComment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getSuggestionId(),
                comment.getUserId(),
                comment.getUsername(),
                comment.getContent(),
                comment.getTimestamp(),
                comment.getQuotedCommentId(),
                comment.getQuotedUsername(),
                comment.getQuotedContent());
    }
}
