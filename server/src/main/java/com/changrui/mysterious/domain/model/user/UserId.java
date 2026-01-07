package com.changrui.mysterious.domain.model.user;

import java.util.Objects;

/**
 * Value Object représentant l'identifiant unique d'un utilisateur.
 * Immutable et validé à la construction.
 */
public record UserId(String value) {

    public UserId {
        Objects.requireNonNull(value, "User ID cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be blank");
        }
    }

    public static UserId of(String value) {
        return new UserId(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
