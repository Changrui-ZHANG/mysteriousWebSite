package com.changrui.mysterious.domain.vocabulary.service;

import com.changrui.mysterious.domain.vocabulary.model.UserVocabularyFavorite;
import com.changrui.mysterious.domain.vocabulary.model.VocabularyItem;
import com.changrui.mysterious.domain.vocabulary.repository.UserVocabularyFavoriteRepository;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing user vocabulary favorites.
 */
@Service
public class VocabularyFavoriteService {

    @Autowired
    private UserVocabularyFavoriteRepository favoriteRepository;

    @Autowired
    private VocabularyService vocabularyService;

    /**
     * Get all favorite vocabulary IDs for a user.
     */
    public Set<Integer> getFavoriteIds(String userId) {
        return favoriteRepository.findVocabularyIdsByUserId(userId);
    }

    /**
     * Add a vocabulary item to user's favorites.
     */
    @Transactional
    public Set<Integer> addFavorite(String userId, Integer vocabularyId) {
        if (!favoriteRepository.existsByUserIdAndVocabularyId(userId, vocabularyId)) {
            favoriteRepository.save(new UserVocabularyFavorite(userId, vocabularyId));
        }
        return getFavoriteIds(userId);
    }

    /**
     * Remove a vocabulary item from user's favorites.
     */
    @Transactional
    public Set<Integer> removeFavorite(String userId, Integer vocabularyId) {
        favoriteRepository.deleteByUserIdAndVocabularyId(userId, vocabularyId);
        return getFavoriteIds(userId);
    }

    /**
     * Get full vocabulary items for user's favorites.
     */
    public List<VocabularyItem> getFavoriteDetails(String userId) {
        Set<Integer> ids = getFavoriteIds(userId);
        return vocabularyService.getAllItems().stream()
                .filter(item -> ids.contains(item.getId()))
                .collect(Collectors.toList());
    }
}
