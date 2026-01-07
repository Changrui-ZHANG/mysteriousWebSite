package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.vocabulary.VocabularyItem;
import com.changrui.mysterious.infrastructure.persistence.entity.VocabularyItemEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class VocabularyItemMapper {

    @Nullable
    public VocabularyItem toDomain(@Nullable VocabularyItemEntity entity) {
        if (entity == null)
            return null;
        return VocabularyItem.reconstitute(
                entity.getId(),
                entity.getExpression(),
                entity.getMeaning(),
                entity.getMeaningEn(),
                entity.getMeaningZh(),
                entity.getExample(),
                entity.getLevel());
    }

    @Nullable
    public VocabularyItemEntity toEntity(@Nullable VocabularyItem domain) {
        if (domain == null)
            return null;
        VocabularyItemEntity entity = new VocabularyItemEntity();
        entity.setId(domain.getId());
        entity.setExpression(domain.getExpression());
        entity.setMeaning(domain.getMeaning());
        entity.setMeaningEn(domain.getMeaningEn());
        entity.setMeaningZh(domain.getMeaningZh());
        entity.setExample(domain.getExample());
        entity.setLevel(domain.getLevel());
        return entity;
    }
}
