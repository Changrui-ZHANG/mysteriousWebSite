package com.changrui.mysterious.domain.port.in;

import com.changrui.mysterious.domain.model.user.User;

/**
 * Port d'entrée (Use Case) pour la connexion d'un utilisateur.
 */
public interface LoginUserUseCase {

    /**
     * Authentifie un utilisateur avec ses identifiants
     * 
     * @param command Les identifiants de connexion
     * @return L'utilisateur authentifié
     * @throws com.changrui.mysterious.domain.exception.InvalidCredentialsException si
     *                                                                              les
     *                                                                              identifiants
     *                                                                              sont
     *                                                                              invalides
     */
    User execute(LoginUserCommand command);

    /**
     * Commande contenant les identifiants de connexion
     */
    record LoginUserCommand(
            String username,
            String password) {
        public LoginUserCommand {
            if (username == null || username.isBlank()) {
                throw new IllegalArgumentException("Username is required");
            }
            if (password == null || password.isBlank()) {
                throw new IllegalArgumentException("Password is required");
            }
        }
    }
}
