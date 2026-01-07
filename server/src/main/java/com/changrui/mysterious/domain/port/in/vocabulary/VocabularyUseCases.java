package com.changrui.mysterious.domain.port.in.vocabulary;

import com.changrui.mysterious.domain.model.vocabulary.VocabularyItem;
import java.util.List;
import java.util.Set;

public interface VocabularyUseCases {
    List<VocabularyItem> getAllItems();

    VocabularyItem getRandomItem();

    VocabularyItem getDailyItem();

    void reloadData();

    // Favorites
    Set<Integer> getFavorites(String userId);

    void addFavorite(String userId, Integer vocabId);

    void removeFavorite(String userId, Integer vocabId);

    List<VocabularyItem> getFavoritesDetails(String userId);
}
