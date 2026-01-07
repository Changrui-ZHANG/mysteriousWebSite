package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.user.User;
import com.changrui.mysterious.domain.model.user.UserId;
import com.changrui.mysterious.infrastructure.persistence.entity.AppUserEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

/**
 * Mapper pour convertir entre l'entité JPA (AppUserEntity) et l'entité de
 * domaine (User).
 * Fait partie de la couche infrastructure.
 */
@Component
public class UserMapper {

    /**
     * Convertit une entité JPA vers une entité de domaine
     */
    @Nullable
    public User toDomain(@Nullable AppUserEntity entity) {
        if (entity == null) {
            return null;
        }

        return User.reconstitute(
                UserId.of(entity.getId()),
                entity.getUsername(),
                entity.getPassword(),
                entity.getPlainPassword(),
                entity.getPreferredLanguage(),
                entity.getVocabularyFavorites());
    }

    /**
     * Convertit une entité de domaine vers une entité JPA
     */
    @Nullable
    public AppUserEntity toEntity(@Nullable User user) {
        if (user == null) {
            return null;
        }

        AppUserEntity entity = new AppUserEntity();

        // Si l'utilisateur a un ID, c'est une mise à jour
        if (user.getId() != null) {
            entity.setId(user.getId().value());
        }

        entity.setUsername(user.getUsername());
        entity.setPassword(user.getPassword());
        entity.setPlainPassword(user.getPlainPassword());
        entity.setPreferredLanguage(user.getPreferredLanguage());
        entity.setVocabularyFavorites(user.getVocabularyFavorites());

        return entity;
    }

    /**
     * Met à jour une entité JPA existante avec les données du domaine
     */
    public void updateEntity(AppUserEntity entity, User user) {
        entity.setUsername(user.getUsername());
        entity.setPassword(user.getPassword());
        entity.setPlainPassword(user.getPlainPassword());
        entity.setPreferredLanguage(user.getPreferredLanguage());
        entity.setVocabularyFavorites(user.getVocabularyFavorites());
    }
}
