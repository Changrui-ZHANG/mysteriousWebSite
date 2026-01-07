package com.changrui.mysterious.application.service.vocabulary;

import com.changrui.mysterious.domain.model.user.User;
import com.changrui.mysterious.domain.model.user.UserId;
import com.changrui.mysterious.domain.model.vocabulary.VocabularyItem;
import com.changrui.mysterious.domain.port.in.vocabulary.VocabularyUseCases;
import com.changrui.mysterious.domain.port.out.UserRepository;
import com.changrui.mysterious.domain.port.out.VocabularyRepository;
import com.changrui.mysterious.domain.exception.UserNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Transactional
public class VocabularyManagementService implements VocabularyUseCases {

    private final VocabularyRepository vocabularyRepository;
    private final UserRepository userRepository;

    private List<VocabularyItem> cachedList = null;

    public VocabularyManagementService(VocabularyRepository vocabularyRepository, UserRepository userRepository) {
        this.vocabularyRepository = vocabularyRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void reloadData() {
        cachedList = vocabularyRepository.findAll();
    }

    private synchronized void ensureCache() {
        if (cachedList == null || cachedList.isEmpty()) {
            reloadData();
        }
    }

    @Override
    public List<VocabularyItem> getAllItems() {
        ensureCache();
        return cachedList;
    }

    @Override
    public VocabularyItem getRandomItem() {
        ensureCache();
        if (cachedList.isEmpty())
            return null;
        int randomIndex = ThreadLocalRandom.current().nextInt(cachedList.size());
        return cachedList.get(randomIndex);
    }

    @Override
    public VocabularyItem getDailyItem() {
        ensureCache();
        if (cachedList.isEmpty())
            return null;
        long currentDayEpoch = System.currentTimeMillis() / (1000 * 60 * 60 * 24);
        int index = (int) (currentDayEpoch % cachedList.size());
        return cachedList.get(Math.abs(index));
    }

    // --- Favorites Logic ---

    @Override
    public Set<Integer> getFavorites(String userId) {
        return findUser(userId).getVocabularyFavorites();
    }

    @Override
    public void addFavorite(String userId, Integer vocabId) {
        User user = findUser(userId);
        user.addVocabularyFavorite(vocabId);
        userRepository.save(user);
    }

    @Override
    public void removeFavorite(String userId, Integer vocabId) {
        User user = findUser(userId);
        user.removeVocabularyFavorite(vocabId);
        userRepository.save(user);
    }

    @Override
    public List<VocabularyItem> getFavoritesDetails(String userId) {
        Set<Integer> favoriteIds = getFavorites(userId);
        return getAllItems().stream()
                .filter(item -> favoriteIds.contains(item.getId()))
                .collect(Collectors.toList());
    }

    private User findUser(String userId) {
        return userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }
}
