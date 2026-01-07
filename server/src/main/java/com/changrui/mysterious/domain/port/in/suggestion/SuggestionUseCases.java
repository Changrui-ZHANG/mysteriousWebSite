package com.changrui.mysterious.domain.port.in.suggestion;

import com.changrui.mysterious.domain.model.suggestion.Suggestion;
import com.changrui.mysterious.domain.model.suggestion.SuggestionComment;
import java.util.List;

public interface SuggestionUseCases {

    // Suggestions
    List<Suggestion> getAllSuggestions();

    List<Suggestion> getUserSuggestions(String userId);

    Suggestion submitSuggestion(SubmitSuggestionCommand command);

    void updateStatus(String id, String status);

    void deleteSuggestion(String id);

    // Comments
    List<SuggestionComment> getComments(String suggestionId);

    SuggestionComment addComment(String suggestionId, AddCommentCommand command);

    void deleteComment(String commentId);

    long getCommentCount(String suggestionId);

    // Commands
    record SubmitSuggestionCommand(String userId, String username, String content) {
    }

    record AddCommentCommand(String userId, String username, String content, String quotedCommentId) {
    }
}
