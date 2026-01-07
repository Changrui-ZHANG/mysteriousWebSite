package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.vocabulary.VocabularyItem;
import java.util.List;
import java.util.Optional;

public interface VocabularyRepository {
    List<VocabularyItem> findAll();

    Optional<VocabularyItem> findById(Integer id);

    VocabularyItem save(VocabularyItem item);
}
