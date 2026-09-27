package com.changrui.mysterious.domain.user.service;

import com.changrui.mysterious.domain.user.model.AppUser;
import com.changrui.mysterious.domain.user.repository.AppUserRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for user verification operations.
 * Provides a clean interface for other domains to verify user existence
 * without directly accessing the user repository.
 */
@Service
public class UserVerificationService {

    @Autowired
    private AppUserRepository appUserRepository;

    /**
     * Check if a user exists by their ID.
     */
    public boolean userExists(String userId) {
        return userId != null && appUserRepository.existsById(userId);
    }

    /**
     * Username of a registered user, if the id exists.
     */
    public Optional<String> findUsername(String userId) {
        return userId == null ? Optional.empty() : appUserRepository.findById(userId).map(AppUser::getUsername);
    }

    /**
     * Check if a user exists by their username.
     */
    public boolean usernameExists(String username) {
        return username != null && appUserRepository.existsByUsername(username);
    }
}
