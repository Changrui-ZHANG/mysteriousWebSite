package com.changrui.mysterious.domain.messagewall.service;

import com.changrui.mysterious.domain.messagewall.dto.CommentCreateDTO;
import com.changrui.mysterious.domain.messagewall.dto.SuggestionCreateDTO;
import com.changrui.mysterious.domain.messagewall.dto.SuggestionResponseDTO;
import com.changrui.mysterious.domain.messagewall.model.Suggestion;
import com.changrui.mysterious.domain.messagewall.model.SuggestionComment;
import com.changrui.mysterious.domain.messagewall.repository.SuggestionCommentRepository;
import com.changrui.mysterious.domain.messagewall.repository.SuggestionRepository;
import com.changrui.mysterious.shared.exception.EntityNotFoundException;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return withCommentCounts(suggestionRepository.findAllByOrderByTimestampDesc());
    }

    /**
     * Get suggestions for a specific user.
     */
    public List<SuggestionResponseDTO> getUserSuggestions(String userId) {
        return withCommentCounts(suggestionRepository.findByUserIdOrderByTimestampDesc(userId));
    }

    /**
     * Attach comment counts using a single GROUP BY query.
     */
    private List<SuggestionResponseDTO> withCommentCounts(List<Suggestion> suggestions) {
        if (suggestions.isEmpty()) {
            return List.of();
        }
        Map<String, Long> counts = commentRepository
                .countBySuggestionIds(suggestions.stream().map(Suggestion::getId).toList())
                .stream()
                .collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));
        return suggestions.stream()
                .map(s -> SuggestionResponseDTO.from(s, counts.getOrDefault(s.getId(), 0L)))
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
     * Delete a suggestion. Allowed for admins or the suggestion's owner.
     */
    @Transactional
    public void deleteSuggestion(String id, String requesterId, boolean isAdmin) {
        Suggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Suggestion", id));
        if (!isAdmin && (requesterId == null || !requesterId.equals(suggestion.getUserId()))) {
            throw new UnauthorizedException("You can only delete your own suggestions");
        }
        suggestionRepository.delete(suggestion);
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
     * Delete a comment. Allowed for admins or the comment's owner.
     */
    @Transactional
    public void deleteComment(String commentId, String requesterId, boolean isAdmin) {
        SuggestionComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment", commentId));
        if (!isAdmin && (requesterId == null || !requesterId.equals(comment.getUserId()))) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }
}
