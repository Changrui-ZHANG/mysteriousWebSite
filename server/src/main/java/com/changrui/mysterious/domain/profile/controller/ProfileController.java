package com.changrui.mysterious.domain.profile.controller;

import com.changrui.mysterious.domain.profile.dto.*;
import com.changrui.mysterious.domain.profile.middleware.FilterPrivateFields;
import com.changrui.mysterious.domain.profile.middleware.PrivacyFilterMiddleware;
import com.changrui.mysterious.domain.profile.middleware.RequirePrivacyLevel;
import com.changrui.mysterious.domain.profile.middleware.RequireProfileOwnership;
import com.changrui.mysterious.domain.profile.service.ProfileIntegrationService;
import com.changrui.mysterious.domain.profile.service.ProfileService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user profile operations.
 * REST endpoints for profile management with authentication middleware.
 */
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private ProfileIntegrationService profileIntegrationService;

    /**
     * Create a new user profile
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(
            @Valid @RequestBody CreateProfileRequest request,
            HttpServletRequest httpRequest) {

        // Extract requester ID from request (handled by middleware)
        String requesterId = httpRequest.getParameter("requesterId");
        if (requesterId == null) {
            requesterId = httpRequest.getHeader("X-Requester-Id");
        }

        ProfileResponse profile = profileService.createProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile created successfully", profile));
    }

    /**
     * Get user profile by ID
     * Public endpoint - no ownership required, but privacy rules apply
     */
    @GetMapping("/{userId}")
    @RequirePrivacyLevel(PrivacyFilterMiddleware.PrivacyLevel.PUBLIC)
    @FilterPrivateFields(fields = { "bio", "lastActive", "stats", "achievements" })
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @PathVariable String userId,
            HttpServletRequest httpRequest) {

        String requesterId = httpRequest.getParameter("requesterId");
        if (requesterId == null) {
            requesterId = httpRequest.getHeader("X-Requester-Id");
        }

        // Check if admin access is being used
        String adminCode = httpRequest.getHeader("X-Admin-Code");
        boolean isAdminAccess = adminCode != null && !adminCode.trim().isEmpty();

        ProfileResponse profile = isAdminAccess ? profileService.getProfile(userId, requesterId, true)
                : profileService.getProfile(userId, requesterId);

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Update user profile
     * Requires profile ownership
     */
    @PutMapping("/{userId}")
    @RequireProfileOwnership(allowAdminOverride = true)
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @PathVariable String userId,
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletRequest httpRequest) {

        String requesterId = httpRequest.getParameter("requesterId");
        if (requesterId == null) {
            requesterId = httpRequest.getHeader("X-Requester-Id");
        }

        ProfileResponse profile = profileService.updateProfile(userId, request, requesterId);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    /**
     * Delete user profile
     * Requires profile ownership
     */
    @DeleteMapping("/{userId}")
    @RequireProfileOwnership(allowAdminOverride = true)
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @PathVariable String userId,
            HttpServletRequest httpRequest) {

        String requesterId = httpRequest.getParameter("requesterId");
        if (requesterId == null) {
            requesterId = httpRequest.getHeader("X-Requester-Id");
        }

        profileService.deleteProfile(userId, requesterId);
        return ResponseEntity.ok(ApiResponse.successMessage("Profile deleted successfully"));
    }

    /**
     * Search profiles
     * Public endpoint with rate limiting
     */
    @GetMapping("/search")
    @RequirePrivacyLevel(PrivacyFilterMiddleware.PrivacyLevel.PUBLIC)
    @FilterPrivateFields(fields = { "bio", "lastActive", "stats", "achievements" })
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> searchProfiles(
            @RequestParam String q,
            HttpServletRequest httpRequest) {

        String requesterId = httpRequest.getParameter("requesterId");
        if (requesterId == null) {
            requesterId = httpRequest.getHeader("X-Requester-Id");
        }

        List<ProfileResponse> profiles = profileService.searchProfiles(q, requesterId);
        return ResponseEntity.ok(ApiResponse.success(profiles));
    }

    /**
     * Get public profiles directory
     * Public endpoint with rate limiting
     */
    @GetMapping("/directory")
    @RequirePrivacyLevel(PrivacyFilterMiddleware.PrivacyLevel.PUBLIC)
    @FilterPrivateFields(fields = { "bio", "lastActive", "stats", "achievements" })
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getPublicProfiles(
            HttpServletRequest httpRequest) {

        String requesterId = httpRequest.getParameter("requesterId");
        if (requesterId == null) {
            requesterId = httpRequest.getHeader("X-Requester-Id");
        }

        List<ProfileResponse> profiles = profileService.getPublicProfiles(requesterId);
        return ResponseEntity.ok(ApiResponse.success(profiles));
    }

    /**
     * Update privacy settings
     * Requires profile ownership
     */
    @PutMapping("/{userId}/privacy")
    @RequireProfileOwnership
    public ResponseEntity<ApiResponse<Void>> updatePrivacySettings(
            @PathVariable String userId,
            @Valid @RequestBody UpdatePrivacyRequest request,
            HttpServletRequest httpRequest) {

        String requesterId = httpRequest.getParameter("requesterId");
        if (requesterId == null) {
            requesterId = httpRequest.getHeader("X-Requester-Id");
        }

        profileService.updatePrivacySettings(userId, request, requesterId);
        return ResponseEntity.ok(ApiResponse.successMessage("Privacy settings updated successfully"));
    }

    /**
     * Update last active timestamp
     * Requires profile ownership
     */
    @PostMapping("/{userId}/activity")
    @RequireProfileOwnership
    public ResponseEntity<ApiResponse<Void>> updateLastActive(
            @PathVariable String userId) {

        profileService.updateLastActive(userId);
        return ResponseEntity.ok(ApiResponse.successMessage("Last active updated"));
    }

    /**
     * Get basic profile info for message display (avatar, display name)
     * Public endpoint - no authentication required
     */
    @GetMapping("/{userId}/basic")
    public ResponseEntity<ApiResponse<BasicProfileInfo>> getBasicProfileInfo(
            @PathVariable String userId) {

        var profile = profileIntegrationService.getProfileForMessage(userId);
        if (profile == null) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }

        var basicInfo = new BasicProfileInfo(profile.getDisplayName(), profile.getResolvedAvatarUrl());
        return ResponseEntity.ok(ApiResponse.success(basicInfo));
    }
}