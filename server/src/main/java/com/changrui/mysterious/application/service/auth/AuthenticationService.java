package com.changrui.mysterious.application.service.auth;

import com.changrui.mysterious.domain.exception.InvalidCredentialsException;
import com.changrui.mysterious.domain.exception.UsernameAlreadyExistsException;
import com.changrui.mysterious.domain.model.user.User;
import com.changrui.mysterious.domain.port.in.LoginUserUseCase;
import com.changrui.mysterious.domain.port.in.RegisterUserUseCase;
import com.changrui.mysterious.domain.port.out.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service d'application implémentant les Use Cases d'authentification.
 * Orchestre les appels entre le domaine et l'infrastructure.
 */
@Service
@Transactional
public class AuthenticationService implements RegisterUserUseCase, LoginUserUseCase {

    private final UserRepository userRepository;

    public AuthenticationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User execute(RegisterUserCommand command) {
        // Vérifier si le username existe déjà
        if (userRepository.existsByUsername(command.username())) {
            throw new UsernameAlreadyExistsException(command.username());
        }

        // Créer l'utilisateur via la factory method du domaine
        User newUser = User.create(command.username(), command.password());

        // Persister via le port de sortie
        return userRepository.save(newUser);
    }

    @Override
    public User execute(LoginUserCommand command) {
        // Rechercher l'utilisateur
        User user = userRepository.findByUsername(command.username())
                .orElseThrow(InvalidCredentialsException::new);

        // Vérifier le mot de passe via la logique métier du domaine
        if (!user.checkPassword(command.password())) {
            throw new InvalidCredentialsException();
        }

        return user;
    }
}
