package com.changrui.mysterious.domain.vocabulary.repository;

import com.changrui.mysterious.domain.vocabulary.model.UserVocabularyFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository for UserVocabularyFavorite entity operations.
 */
@Repository
public interface UserVocabularyFavoriteRepository extends JpaRepository<UserVocabularyFavorite, String> {

    @Query("SELECT f.vocabularyId FROM UserVocabularyFavorite f WHERE f.userId = :userId")
    Set<Integer> findVocabularyIdsByUserId(@Param("userId") String userId);

    Optional<UserVocabularyFavorite> findByUserIdAndVocabularyId(String userId, Integer vocabularyId);

    void deleteByUserIdAndVocabularyId(String userId, Integer vocabularyId);

    boolean existsByUserIdAndVocabularyId(String userId, Integer vocabularyId);
}
