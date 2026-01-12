package com.changrui.mysterious.domain.profile.middleware;

import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.exception.NotFoundException;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ProfileAuthMiddleware.
 */
@ExtendWith(MockitoExtension.class)
class ProfileAuthMiddlewareTest {

    @Mock
    private UserProfileRepository profileRepository;

    @Mock
    private AdminService adminService;

    @InjectMocks
    private ProfileAuthMiddleware authMiddleware;

    private UserProfile publicProfile;
    private UserProfile privateProfile;

    @BeforeEach
    void setUp() {
        publicProfile = new UserProfile("user1", "Public User");
        publicProfile.setPublic(true);

        privateProfile = new UserProfile("user2", "Private User");
        privateProfile.setPublic(false);
    }

    @Test
    void verifyProfileAccess_OwnerCanAccessOwnProfile() {
        // Given
        when(profileRepository.findByUserId("user1")).thenReturn(Optional.of(publicProfile));

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> 
            authMiddleware.verifyProfileAccess("user1", "user1", false)
        );
    }

    @Test
    void verifyProfileAccess_OwnerCanAccessOwnProfileWithOwnershipRequired() {
        // Given
        when(profileRepository.findByUserId("user1")).thenReturn(Optional.of(publicProfile));

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> 
            authMiddleware.verifyProfileAccess("user1", "user1", true)
        );
    }

    @Test
    void verifyProfileAccess_NonOwnerCanAccessPublicProfile() {
        // Given
        when(profileRepository.findByUserId("user1")).thenReturn(Optional.of(publicProfile));

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> 
            authMiddleware.verifyProfileAccess("user1", "user2", false)
        );
    }

    @Test
    void verifyProfileAccess_NonOwnerCannotAccessPrivateProfile() {
        // Given
        when(profileRepository.findByUserId("user2")).thenReturn(Optional.of(privateProfile));

        // When & Then
        assertThrows(UnauthorizedException.class, () -> 
            authMiddleware.verifyProfileAccess("user2", "user1", false)
        );
    }

    @Test
    void verifyProfileAccess_NonOwnerCannotModifyProfile() {
        // Given
        when(profileRepository.findByUserId("user1")).thenReturn(Optional.of(publicProfile));

        // When & Then
        assertThrows(UnauthorizedException.class, () -> 
            authMiddleware.verifyProfileAccess("user1", "user2", true)
        );
    }

    @Test
    void verifyProfileAccess_ProfileNotFound() {
        // Given
        when(profileRepository.findByUserId("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () -> 
            authMiddleware.verifyProfileAccess("nonexistent", "user1", false)
        );
    }

    @Test
    void verifyProfileAccess_NullRequesterCanAccessPublicProfile() {
        // Given
        when(profileRepository.findByUserId("user1")).thenReturn(Optional.of(publicProfile));

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> 
            authMiddleware.verifyProfileAccess("user1", null, false)
        );
    }

    @Test
    void verifyProfileAccess_NullRequesterCannotAccessPrivateProfile() {
        // Given
        when(profileRepository.findByUserId("user2")).thenReturn(Optional.of(privateProfile));

        // When & Then
        assertThrows(UnauthorizedException.class, () -> 
            authMiddleware.verifyProfileAccess("user2", null, false)
        );
    }

    @Test
    void verifyProfileAccess_NullRequesterCannotModifyProfile() {
        // Given
        when(profileRepository.findByUserId("user1")).thenReturn(Optional.of(publicProfile));

        // When & Then
        assertThrows(UnauthorizedException.class, () -> 
            authMiddleware.verifyProfileAccess("user1", null, true)
        );
    }
}