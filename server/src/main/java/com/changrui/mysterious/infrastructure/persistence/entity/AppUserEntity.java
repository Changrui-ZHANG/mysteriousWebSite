package com.changrui.mysterious.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité JPA pour la persistance des utilisateurs.
 * Cette classe fait partie de l'infrastructure et contient les annotations JPA.
 * Elle est distincte de l'entité de domaine User.
 */
@Entity
@Table(name = "app_users")
public class AppUserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = true)
    private String plainPassword;

    @Column(nullable = true)
    private String preferredLanguage = "fr";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_vocabulary_favorites", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "vocabulary_id")
    private Set<Integer> vocabularyFavorites = new HashSet<>();

    // === Constructeurs ===

    public AppUserEntity() {
    }

    public AppUserEntity(String username, String password, String plainPassword) {
        this.username = username;
        this.password = password;
        this.plainPassword = plainPassword;
    }

    // === Getters et Setters ===

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPlainPassword() {
        return plainPassword;
    }

    public void setPlainPassword(String plainPassword) {
        this.plainPassword = plainPassword;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public Set<Integer> getVocabularyFavorites() {
        return vocabularyFavorites;
    }

    public void setVocabularyFavorites(Set<Integer> vocabularyFavorites) {
        this.vocabularyFavorites = vocabularyFavorites != null ? vocabularyFavorites : new HashSet<>();
    }
}
