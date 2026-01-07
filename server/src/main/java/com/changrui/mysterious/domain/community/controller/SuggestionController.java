package com.changrui.mysterious.domain.community.controller;

import com.changrui.mysterious.domain.community.dto.*;
import com.changrui.mysterious.domain.community.model.Suggestion;
import com.changrui.mysterious.domain.community.model.SuggestionComment;
import com.changrui.mysterious.domain.community.repository.SuggestionCommentRepository;
import com.changrui.mysterious.domain.community.repository.SuggestionRepository;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing user suggestions.
 */
@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    @Autowired
    private SuggestionRepository suggestionRepository;

    @Autowired
    private SuggestionCommentRepository commentRepository;

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

        suggestionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Suggestion", id));

        suggestionRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.successMessage("Suggestion deleted successfully"));
    }

    // --- Comments Endpoints ---

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<SuggestionComment>>> getComments(@PathVariable String id) {
        List<SuggestionComment> comments = commentRepository.findBySuggestionIdOrderByTimestampAsc(id);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<SuggestionComment>> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentCreateDTO dto) {

        suggestionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Suggestion", id));

        SuggestionComment comment = new SuggestionComment(
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
