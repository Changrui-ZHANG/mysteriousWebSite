package com.changrui.mysterious.service;

import com.changrui.mysterious.model.VocabularyItem;
import com.changrui.mysterious.repository.VocabularyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class VocabularyService {

    @Autowired
    private VocabularyRepository vocabularyRepository;

    private List<VocabularyItem> cachedList = null;

    /**
     * Load data is now effectively just clearing cache or fetching from DB.
     * With 1000 items, we can cache them all in memory for speed, or fetch on
     * demand.
     * Let's cache them to maintain the logic of "random from list".
     */
    public void loadData() {
        // Refresh cache
        cachedList = vocabularyRepository.findAll();
        System.out.println("Loaded " + cachedList.size() + " vocabulary items from DB.");
    }

    private void ensureCache() {
        if (cachedList == null || cachedList.isEmpty()) {
            loadData();
        }
    }

    public VocabularyItem getRandomItem() {
        ensureCache();
        if (cachedList.isEmpty())
            return null;
        int randomIndex = ThreadLocalRandom.current().nextInt(cachedList.size());
        return cachedList.get(randomIndex);
    }

    public VocabularyItem getDailyItem() {
        ensureCache();
        if (cachedList.isEmpty())
            return null;
        long currentDayEpoch = System.currentTimeMillis() / (1000 * 60 * 60 * 24);
        int index = (int) (currentDayEpoch % cachedList.size());
        return cachedList.get(Math.abs(index));
    }

    public List<VocabularyItem> getAllItems() {
        ensureCache();
        return cachedList;
    }
}
