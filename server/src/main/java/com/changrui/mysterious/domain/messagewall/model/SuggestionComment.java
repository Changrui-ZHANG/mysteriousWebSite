package com.changrui.mysterious.domain.messagewall.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a comment on a suggestion.
 * Maps to the 'suggestion_comments' table in the database.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "suggestion_comments")
public class SuggestionComment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String suggestionId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp = LocalDateTime.now();

    private String quotedCommentId;
    private String quotedUsername;
    private String quotedContent;

    public SuggestionComment(String suggestionId, String userId, String username, String content) {
        this.suggestionId = suggestionId;
        this.userId = userId;
        this.username = username;
        this.content = content;
        this.timestamp = LocalDateTime.now();
    }
}
