package com.changrui.mysterious.domain.vocabulary.service;

import com.changrui.mysterious.domain.vocabulary.model.VocabularyItem;
import com.changrui.mysterious.domain.vocabulary.repository.VocabularyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Service for managing vocabulary items.
 */
@Service
public class VocabularyService {

    @Autowired
    private VocabularyRepository vocabularyRepository;

    private List<VocabularyItem> cachedList = null;

    /**
     * Load data from database and cache it.
     */
    public void loadData() {
        cachedList = vocabularyRepository.findAll();
        System.out.println("Loaded " + cachedList.size() + " vocabulary items from DB.");
    }

    private void ensureCache() {
        if (cachedList == null || cachedList.isEmpty()) {
            loadData();
        }
    }

    /**
     * Get a random vocabulary item.
     */
    public VocabularyItem getRandomItem() {
        ensureCache();
        if (cachedList.isEmpty()) return null;
        int randomIndex = ThreadLocalRandom.current().nextInt(cachedList.size());
        return cachedList.get(randomIndex);
    }

    /**
     * Get the daily vocabulary item (deterministic based on day).
     */
    public VocabularyItem getDailyItem() {
        ensureCache();
        if (cachedList.isEmpty()) return null;
        long currentDayEpoch = System.currentTimeMillis() / (1000 * 60 * 60 * 24);
        int index = (int) (currentDayEpoch % cachedList.size());
        return cachedList.get(Math.abs(index));
    }

    /**
     * Get all vocabulary items.
     */
    public List<VocabularyItem> getAllItems() {
        ensureCache();
        return cachedList;
    }
}
