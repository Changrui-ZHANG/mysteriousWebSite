package com.changrui.mysterious.domain.port.in;

import com.changrui.mysterious.domain.model.user.User;

/**
 * Port d'entrée (Use Case) pour l'inscription d'un utilisateur.
 * Définit le contrat que l'application doit implémenter.
 */
public interface RegisterUserUseCase {

    /**
     * Inscrit un nouvel utilisateur dans le système
     * 
     * @param command Les données nécessaires à l'inscription
     * @return L'utilisateur créé
     * @throws com.changrui.mysterious.domain.exception.UsernameAlreadyExistsException si
     *                                                                                 le
     *                                                                                 username
     *                                                                                 existe
     *                                                                                 déjà
     */
    User execute(RegisterUserCommand command);

    /**
     * Commande contenant les données pour l'inscription
     */
    record RegisterUserCommand(
            String username,
            String password) {
        public RegisterUserCommand {
            if (username == null || username.isBlank()) {
                throw new IllegalArgumentException("Username is required");
            }
            if (password == null || password.isBlank()) {
                throw new IllegalArgumentException("Password is required");
            }
        }
    }
}
