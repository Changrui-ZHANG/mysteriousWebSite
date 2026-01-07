package com.changrui.mysterious.domain.messagewall.service;

import com.changrui.mysterious.domain.messagewall.dto.CommentCreateDTO;
import com.changrui.mysterious.domain.messagewall.dto.SuggestionCreateDTO;
import com.changrui.mysterious.domain.messagewall.dto.SuggestionResponseDTO;
import com.changrui.mysterious.domain.messagewall.model.Suggestion;
import com.changrui.mysterious.domain.messagewall.model.SuggestionComment;
import com.changrui.mysterious.domain.messagewall.repository.SuggestionCommentRepository;
import com.changrui.mysterious.domain.messagewall.repository.SuggestionRepository;
import com.changrui.mysterious.shared.exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing suggestions and comments.
 */
@Service
public class SuggestionService {

    @Autowired
    private SuggestionRepository suggestionRepository;

    @Autowired
    private SuggestionCommentRepository commentRepository;

    /**
     * Get all suggestions with comment counts.
     */
    public List<SuggestionResponseDTO> getAllSuggestions() {
        return suggestionRepository.findAllByOrderByTimestampDesc().stream()
                .map(s -> SuggestionResponseDTO.from(s, commentRepository.countBySuggestionId(s.getId())))
                .toList();
    }

    /**
     * Get suggestions for a specific user.
     */
    public List<SuggestionResponseDTO> getUserSuggestions(String userId) {
        return suggestionRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .map(s -> SuggestionResponseDTO.from(s, commentRepository.countBySuggestionId(s.getId())))
                .toList();
    }

    /**
     * Create a new suggestion.
     */
    @Transactional
    public Suggestion createSuggestion(SuggestionCreateDTO dto) {
        Suggestion suggestion = new Suggestion(dto.userId(), dto.username(), dto.suggestion().trim());
        return suggestionRepository.save(suggestion);
    }

    /**
     * Update suggestion status.
     */
    @Transactional
    public void updateStatus(String id, String status) {
        Suggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Suggestion", id));
        suggestion.setStatus(status);
        suggestionRepository.save(suggestion);
    }

    /**
     * Delete a suggestion.
     */
    @Transactional
    public void deleteSuggestion(String id) {
        if (!suggestionRepository.existsById(id)) {
            throw new EntityNotFoundException("Suggestion", id);
        }
        suggestionRepository.deleteById(id);
    }

    /**
     * Get comments for a suggestion.
     */
    public List<SuggestionComment> getComments(String suggestionId) {
        return commentRepository.findBySuggestionIdOrderByTimestampAsc(suggestionId);
    }

    /**
     * Add a comment to a suggestion.
     */
    @Transactional
    public SuggestionComment addComment(String suggestionId, CommentCreateDTO dto) {
        if (!suggestionRepository.existsById(suggestionId)) {
            throw new EntityNotFoundException("Suggestion", suggestionId);
        }

        SuggestionComment comment = new SuggestionComment(
                suggestionId,
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

        return commentRepository.save(comment);
    }

    /**
     * Delete a comment.
     */
    @Transactional
    public void deleteComment(String commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new EntityNotFoundException("Comment", commentId);
        }
        commentRepository.deleteById(commentId);
    }
}
