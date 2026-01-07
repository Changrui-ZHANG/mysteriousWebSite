package com.changrui.mysterious.domain.user.service;

import com.changrui.mysterious.domain.user.repository.AppUserRepository;
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
     * Check if a user exists by their username.
     */
    public boolean usernameExists(String username) {
        return username != null && appUserRepository.existsByUsername(username);
    }
}
