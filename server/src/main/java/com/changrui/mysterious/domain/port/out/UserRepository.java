package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.user.User;
import com.changrui.mysterious.domain.model.user.UserId;

import java.util.List;
import java.util.Optional;

/**
 * Port de sortie pour la persistance des utilisateurs.
 * Cette interface définit le contrat que doit respecter tout adapter de
 * persistance.
 * Elle ne contient AUCUNE dépendance vers Spring ou JPA.
 */
public interface UserRepository {

    /**
     * Recherche un utilisateur par son identifiant unique
     */
    Optional<User> findById(UserId id);

    /**
     * Recherche un utilisateur par son nom d'utilisateur
     */
    Optional<User> findByUsername(String username);

    /**
     * Vérifie si un nom d'utilisateur existe déjà
     */
    boolean existsByUsername(String username);

    /**
     * Sauvegarde un utilisateur (création ou mise à jour)
     */
    User save(User user);

    /**
     * Supprime un utilisateur par son identifiant
     */
    void deleteById(UserId id);

    /**
     * Récupère tous les utilisateurs
     */
    List<User> findAll();
}
