package com.changrui.mysterious.domain.vocabulary.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a user's vocabulary favorite.
 * Maps to the 'user_vocabulary_favorites' table in the database.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "user_vocabulary_favorites", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id",
        "vocabulary_id" }))
public class UserVocabularyFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "vocabulary_id", nullable = false)
    private Integer vocabularyId;

    public UserVocabularyFavorite(String userId, Integer vocabularyId) {
        this.userId = userId;
        this.vocabularyId = vocabularyId;
    }
}
