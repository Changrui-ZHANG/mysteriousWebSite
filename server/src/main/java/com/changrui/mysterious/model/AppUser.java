package com.changrui.mysterious.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = true)
    private String plainPassword;

    public AppUser() {
    }

    public AppUser(String username, String password, String plainPassword) {
        this.username = username;
        this.password = password;
        this.plainPassword = plainPassword;
    }

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

    @Column(nullable = true)
    private String preferredLanguage = "fr";

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_vocabulary_favorites", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "vocabulary_id")
    private java.util.Set<Integer> vocabularyFavorites = new java.util.HashSet<>();

    public java.util.Set<Integer> getVocabularyFavorites() {
        return vocabularyFavorites;
    }

    public void setVocabularyFavorites(java.util.Set<Integer> vocabularyFavorites) {
        this.vocabularyFavorites = vocabularyFavorites;
    }
}
