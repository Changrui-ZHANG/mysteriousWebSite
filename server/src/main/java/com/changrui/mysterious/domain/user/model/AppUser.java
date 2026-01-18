package com.changrui.mysterious.domain.user.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing an application user.
 * Maps to the 'app_users' table in the database.
 */
@Data
@NoArgsConstructor
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

    @Column(nullable = true)
    private String preferredLanguage = "fr";

    public AppUser(String username, String password, String plainPassword) {
        this.username = username;
        this.password = password;
        this.plainPassword = plainPassword;
    }
}
