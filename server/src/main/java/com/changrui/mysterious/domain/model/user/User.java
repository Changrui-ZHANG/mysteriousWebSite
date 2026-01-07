package com.changrui.mysterious.domain.model.user;

import java.util.Objects;
import java.util.Set;
import java.util.HashSet;

/**
 * Entité de domaine User.
 * Cette classe représente le cœur métier d'un utilisateur, sans aucune
 * dépendance
 * vers Spring ou JPA. Elle contient uniquement la logique métier pure.
 */
public class User {

    private final UserId id;
    private String username;
    private String password;
    private String plainPassword;
    private String preferredLanguage;
    private final Set<Integer> vocabularyFavorites;

    // Constructeur privé - utiliser les factory methods
    private User(UserId id, String username, String password, String plainPassword,
            String preferredLanguage, Set<Integer> vocabularyFavorites) {
        this.id = id;
        this.username = Objects.requireNonNull(username, "Username cannot be null");
        this.password = Objects.requireNonNull(password, "Password cannot be null");
        this.plainPassword = plainPassword;
        this.preferredLanguage = preferredLanguage != null ? preferredLanguage : "fr";
        this.vocabularyFavorites = vocabularyFavorites != null ? new HashSet<>(vocabularyFavorites) : new HashSet<>();
    }

    /**
     * Factory method pour créer un nouvel utilisateur (inscription)
     */
    public static User create(String username, String password) {
        validateUsername(username);
        validatePassword(password);
        return new User(null, username, password, password, "fr", new HashSet<>());
    }

    /**
     * Factory method pour reconstituer un utilisateur depuis la persistence
     */
    public static User reconstitute(UserId id, String username, String password,
            String plainPassword, String preferredLanguage,
            Set<Integer> vocabularyFavorites) {
        return new User(id, username, password, plainPassword, preferredLanguage, vocabularyFavorites);
    }

    // === Règles métier ===

    private static void validateUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username cannot be blank");
        }
        if (username.length() < 3) {
            throw new IllegalArgumentException("Username must be at least 3 characters");
        }
        if (username.length() > 50) {
            throw new IllegalArgumentException("Username cannot exceed 50 characters");
        }
    }

    private static void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password cannot be blank");
        }
        if (password.length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters");
        }
    }

    /**
     * Vérifie si le mot de passe fourni correspond au mot de passe de l'utilisateur
     */
    public boolean checkPassword(String rawPassword) {
        return this.password.equals(rawPassword);
    }

    /**
     * Change la langue préférée de l'utilisateur
     */
    public void changePreferredLanguage(String language) {
        if (language == null || language.isBlank()) {
            throw new IllegalArgumentException("Language cannot be blank");
        }
        this.preferredLanguage = language;
    }

    /**
     * Ajoute un vocabulaire aux favoris
     */
    public void addVocabularyFavorite(Integer vocabularyId) {
        this.vocabularyFavorites.add(vocabularyId);
    }

    /**
     * Retire un vocabulaire des favoris
     */
    public void removeVocabularyFavorite(Integer vocabularyId) {
        this.vocabularyFavorites.remove(vocabularyId);
    }

    // === Getters ===

    public UserId getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getPlainPassword() {
        return plainPassword;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public Set<Integer> getVocabularyFavorites() {
        return Set.copyOf(vocabularyFavorites); // Retourne une copie immutable
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
