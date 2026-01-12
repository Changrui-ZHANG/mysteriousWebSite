package com.changrui.mysterious.domain.profile.middleware;

import com.changrui.mysterious.domain.profile.model.PrivacySettings;
import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrivacyFilterMiddlewareTest {

    @Mock
    private UserProfileRepository profileRepository;

    @Mock
    private AdminService adminService;

    @InjectMocks
    private PrivacyFilterMiddleware privacyFilterMiddleware;

    private UserProfile testProfile;
    private PrivacySettings testPrivacySettings;

    @BeforeEach
    void setUp() {
        testProfile = new UserProfile("user123", "Test User");
        testProfile.setBio("Test bio");
        testProfile.setAvatarUrl("avatar.jpg");
        testProfile.setPublic(true);
        testProfile.setLastActive(LocalDateTime.now());

        testPrivacySettings = new PrivacySettings("user123");
        testPrivacySettings.setShowBio(true);
        testPrivacySettings.setShowStats(true);
        testPrivacySettings.setShowAchievements(true);
        testPrivacySettings.setShowLastActive(true);
    }

    @Test
    void determinePrivacyLevel_OwnerAccess_ShouldReturnOwner() {
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        PrivacyFilterMiddleware.PrivacyLevel level = privacyFilterMiddleware
            .determinePrivacyLevel("user123", "user123", null);

        assertEquals(PrivacyFilterMiddleware.PrivacyLevel.OWNER, level);
    }

    @Test
    void determinePrivacyLevel_AdminAccess_ShouldReturnAdmin() {
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));
        when(adminService.isValidAdminCode("admin123")).thenReturn(true);

        PrivacyFilterMiddleware.PrivacyLevel level = privacyFilterMiddleware
            .determinePrivacyLevel("user123", "other456", "admin123");

        assertEquals(PrivacyFilterMiddleware.PrivacyLevel.ADMIN, level);
    }

    @Test
    void determinePrivacyLevel_PublicProfile_ShouldReturnPublic() {
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        PrivacyFilterMiddleware.PrivacyLevel level = privacyFilterMiddleware
            .determinePrivacyLevel("user123", "other456", null);

        assertEquals(PrivacyFilterMiddleware.PrivacyLevel.PUBLIC, level);
    }

    @Test
    void determinePrivacyLevel_PrivateProfile_ShouldReturnDenied() {
        testProfile.setPublic(false);
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        PrivacyFilterMiddleware.PrivacyLevel level = privacyFilterMiddleware
            .determinePrivacyLevel("user123", "other456", null);

        assertEquals(PrivacyFilterMiddleware.PrivacyLevel.DENIED, level);
    }

    @Test
    void determinePrivacyLevel_ProfileNotFound_ShouldReturnDenied() {
        when(profileRepository.findByUserId("nonexistent")).thenReturn(Optional.empty());

        PrivacyFilterMiddleware.PrivacyLevel level = privacyFilterMiddleware
            .determinePrivacyLevel("nonexistent", "other456", null);

        assertEquals(PrivacyFilterMiddleware.PrivacyLevel.DENIED, level);
    }

    @Test
    void canAccessField_OwnerAccess_ShouldAllowAllFields() {
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "bio", PrivacyFilterMiddleware.PrivacyLevel.OWNER));
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "stats", PrivacyFilterMiddleware.PrivacyLevel.OWNER));
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "achievements", PrivacyFilterMiddleware.PrivacyLevel.OWNER));
    }

    @Test
    void canAccessField_AdminAccess_ShouldAllowAllFields() {
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "bio", PrivacyFilterMiddleware.PrivacyLevel.ADMIN));
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "stats", PrivacyFilterMiddleware.PrivacyLevel.ADMIN));
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "achievements", PrivacyFilterMiddleware.PrivacyLevel.ADMIN));
    }

    @Test
    void canAccessField_DeniedAccess_ShouldDenyAllFields() {
        assertFalse(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "bio", PrivacyFilterMiddleware.PrivacyLevel.DENIED));
        assertFalse(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "stats", PrivacyFilterMiddleware.PrivacyLevel.DENIED));
        assertFalse(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "achievements", PrivacyFilterMiddleware.PrivacyLevel.DENIED));
    }

    @Test
    void canAccessField_PublicAccessWithPrivacySettings_ShouldRespectSettings() {
        testPrivacySettings.setShowBio(false);
        testPrivacySettings.setShowStats(true);

        assertFalse(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "bio", PrivacyFilterMiddleware.PrivacyLevel.PUBLIC));
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "stats", PrivacyFilterMiddleware.PrivacyLevel.PUBLIC));
    }

    @Test
    void canAccessField_PublicAccessAlwaysVisibleFields_ShouldAllow() {
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "displayName", PrivacyFilterMiddleware.PrivacyLevel.PUBLIC));
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "avatarUrl", PrivacyFilterMiddleware.PrivacyLevel.PUBLIC));
        assertTrue(privacyFilterMiddleware.canAccessField(
            testPrivacySettings, "joinDate", PrivacyFilterMiddleware.PrivacyLevel.PUBLIC));
    }

    @Test
    void filterProfile_OwnerAccess_ShouldReturnUnfilteredProfile() {
        UserProfile result = privacyFilterMiddleware.filterProfile(
            testProfile, testPrivacySettings, PrivacyFilterMiddleware.PrivacyLevel.OWNER);

        assertEquals(testProfile, result);
        assertEquals("Test bio", result.getBio());
        assertNotNull(result.getLastActive());
    }

    @Test
    void filterProfile_DeniedAccess_ShouldReturnNull() {
        UserProfile result = privacyFilterMiddleware.filterProfile(
            testProfile, testPrivacySettings, PrivacyFilterMiddleware.PrivacyLevel.DENIED);

        assertNull(result);
    }

    @Test
    void filterProfile_PublicAccessWithPrivateSettings_ShouldFilterFields() {
        testPrivacySettings.setShowBio(false);
        testPrivacySettings.setShowLastActive(false);

        UserProfile result = privacyFilterMiddleware.filterProfile(
            testProfile, testPrivacySettings, PrivacyFilterMiddleware.PrivacyLevel.PUBLIC);

        assertNotNull(result);
        assertEquals("user123", result.getUserId());
        assertEquals("Test User", result.getDisplayName());
        assertNull(result.getBio()); // Should be filtered out
        assertNull(result.getLastActive()); // Should be filtered out
        assertEquals("avatar.jpg", result.getAvatarUrl()); // Should be visible
    }

    @Test
    void validateOperation_ReadOperationPublicProfile_ShouldPass() {
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        assertDoesNotThrow(() -> {
            privacyFilterMiddleware.validateOperation("user123", "other456", "read", null);
        });
    }

    @Test
    void validateOperation_ReadOperationPrivateProfile_ShouldThrowException() {
        testProfile.setPublic(false);
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            privacyFilterMiddleware.validateOperation("user123", "other456", "read", null);
        });

        assertTrue(exception.getMessage().contains("permission to view"));
    }

    @Test
    void validateOperation_UpdateOperationByOwner_ShouldPass() {
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        assertDoesNotThrow(() -> {
            privacyFilterMiddleware.validateOperation("user123", "user123", "update", null);
        });
    }

    @Test
    void validateOperation_UpdateOperationByNonOwner_ShouldThrowException() {
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            privacyFilterMiddleware.validateOperation("user123", "other456", "update", null);
        });

        assertTrue(exception.getMessage().contains("only modify your own profile"));
    }

    @Test
    void validateOperation_AdminOperationWithValidCode_ShouldPass() {
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));
        when(adminService.isValidAdminCode("admin123")).thenReturn(true);

        assertDoesNotThrow(() -> {
            privacyFilterMiddleware.validateOperation("user123", "other456", "admin_view", "admin123");
        });
    }

    @Test
    void validateOperation_AdminOperationWithoutCode_ShouldThrowException() {
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            privacyFilterMiddleware.validateOperation("user123", "other456", "admin_view", null);
        });

        assertTrue(exception.getMessage().contains("Admin privileges required"));
    }

    @Test
    void isVisibleInSearch_PublicProfile_ShouldReturnTrue() {
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        boolean result = privacyFilterMiddleware.isVisibleInSearch(
            testProfile, testPrivacySettings, "other456", null);

        assertTrue(result);
    }

    @Test
    void isVisibleInSearch_PrivateProfileVisibility_ShouldReturnFalseForNonOwner() {
        testPrivacySettings.setProfileVisibility("private");
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        boolean result = privacyFilterMiddleware.isVisibleInSearch(
            testProfile, testPrivacySettings, "other456", null);

        assertFalse(result);
    }

    @Test
    void isVisibleInSearch_PrivateProfileVisibilityByOwner_ShouldReturnTrue() {
        testPrivacySettings.setProfileVisibility("private");
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        boolean result = privacyFilterMiddleware.isVisibleInSearch(
            testProfile, testPrivacySettings, "user123", null);

        assertTrue(result);
    }
}