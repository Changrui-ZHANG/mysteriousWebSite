package com.changrui.mysterious.application.service.suggestion;

import com.changrui.mysterious.domain.exception.EntityNotFoundException;
import com.changrui.mysterious.domain.model.suggestion.Suggestion;
import com.changrui.mysterious.domain.model.suggestion.SuggestionComment;
import com.changrui.mysterious.domain.port.in.suggestion.SuggestionUseCases;
import com.changrui.mysterious.domain.port.out.SuggestionCommentRepository;
import com.changrui.mysterious.domain.port.out.SuggestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SuggestionManagementService implements SuggestionUseCases {

    private final SuggestionRepository suggestionRepository;
    private final SuggestionCommentRepository commentRepository;

    public SuggestionManagementService(SuggestionRepository suggestionRepository,
            SuggestionCommentRepository commentRepository) {
        this.suggestionRepository = suggestionRepository;
        this.commentRepository = commentRepository;
    }

    // --- Suggestions ---

    @Override
    public List<Suggestion> getAllSuggestions() {
        return suggestionRepository.findAll();
    }

    @Override
    public List<Suggestion> getUserSuggestions(String userId) {
        return suggestionRepository.findByUserId(userId);
    }

    @Override
    public Suggestion submitSuggestion(SubmitSuggestionCommand command) {
        Suggestion suggestion = Suggestion.create(command.userId(), command.username(), command.content());
        return suggestionRepository.save(suggestion);
    }

    @Override
    public void updateStatus(String id, String status) {
        Suggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Suggestion not found"));

        suggestion.updateStatus(Suggestion.SuggestionStatus.fromString(status));
        suggestionRepository.save(suggestion);
    }

    @Override
    public void deleteSuggestion(String id) {
        if (suggestionRepository.findById(id).isEmpty()) {
            throw new EntityNotFoundException("Suggestion not found");
        }
        suggestionRepository.deleteById(id);
    }

    // --- Comments ---

    @Override
    public List<SuggestionComment> getComments(String suggestionId) {
        return commentRepository.findBySuggestionId(suggestionId);
    }

    @Override
    public SuggestionComment addComment(String suggestionId, AddCommentCommand command) {
        if (suggestionRepository.findById(suggestionId).isEmpty()) {
            throw new EntityNotFoundException("Suggestion not found");
        }

        SuggestionComment comment = SuggestionComment.create(suggestionId, command.userId(), command.username(),
                command.content());

        if (command.quotedCommentId() != null) {
            commentRepository.findById(command.quotedCommentId())
                    .ifPresent(quoted -> comment.setQuote(quoted.getId(), quoted.getUsername(), quoted.getContent()));
        }

        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(String commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new EntityNotFoundException("Comment not found");
        }
        commentRepository.deleteById(commentId);
    }

    @Override
    public long getCommentCount(String suggestionId) {
        return commentRepository.countBySuggestionId(suggestionId);
    }
}
