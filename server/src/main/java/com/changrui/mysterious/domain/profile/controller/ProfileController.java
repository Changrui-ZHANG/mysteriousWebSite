package com.changrui.mysterious.domain.profile.controller;

import com.changrui.mysterious.domain.profile.dto.*;
import com.changrui.mysterious.domain.profile.middleware.FilterPrivateFields;
import com.changrui.mysterious.domain.profile.service.ProfileIntegrationService;
import com.changrui.mysterious.domain.profile.service.ProfileService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.security.CurrentUser;
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

    @Autowired
    private AdminService adminService;

    @Autowired
    private CurrentUser currentUser;

    /**
     * True only if the X-Admin-Code header carries a valid admin code
     */
    private boolean hasValidAdminCode(HttpServletRequest httpRequest) {
        String adminCode = httpRequest.getHeader("X-Admin-Code");
        return adminCode != null && adminService.isValidAdminCode(adminCode.trim());
    }

    /**
     * Create a new user profile
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(
            @Valid @RequestBody CreateProfileRequest request,
            HttpServletRequest httpRequest) {

        // A profile can only be created for the caller's own account (or by an admin)
        if (!hasValidAdminCode(httpRequest)) {
            currentUser.requireRegisteredSelf(request.userId());
        }

        ProfileResponse profile = profileService.createProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile created successfully", profile));
    }

    /**
     * Get user profile by ID
     * Public endpoint - no ownership required, but privacy rules apply
     */
    @GetMapping("/{userId}")
    @FilterPrivateFields(fields = { "bio", "lastActive", "stats", "achievements" })
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @PathVariable String userId,
            HttpServletRequest httpRequest) {

        // Requester identity comes from the verified token, never from client parameters
        String requesterId = currentUser.currentUserId().orElse(null);

        // Check if admin access is being used
        boolean isAdminAccess = hasValidAdminCode(httpRequest);

        ProfileResponse profile = isAdminAccess ? profileService.getProfile(userId, requesterId, true)
                : profileService.getProfile(userId, requesterId);

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Update user profile
     * Requires profile ownership
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @PathVariable String userId,
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletRequest httpRequest) {

        // Requester identity comes from the verified token, never from client parameters
        String requesterId = currentUser.currentUserId().orElse(null);

        ProfileResponse profile = profileService.updateProfile(userId, request, requesterId,
                hasValidAdminCode(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    /**
     * Delete user profile
     * Requires profile ownership
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @PathVariable String userId,
            HttpServletRequest httpRequest) {

        // Requester identity comes from the verified token, never from client parameters
        String requesterId = currentUser.currentUserId().orElse(null);

        profileService.deleteProfile(userId, requesterId, hasValidAdminCode(httpRequest));
        return ResponseEntity.ok(ApiResponse.successMessage("Profile deleted successfully"));
    }

    /**
     * Search profiles
     * Public endpoint with rate limiting
     */
    @GetMapping("/search")
    @FilterPrivateFields(fields = { "bio", "lastActive", "stats", "achievements" })
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> searchProfiles(
            @RequestParam String q,
            HttpServletRequest httpRequest) {

        // Requester identity comes from the verified token, never from client parameters
        String requesterId = currentUser.currentUserId().orElse(null);

        List<ProfileResponse> profiles = profileService.searchProfiles(q, requesterId);
        return ResponseEntity.ok(ApiResponse.success(profiles));
    }

    /**
     * Get public profiles directory
     * Public endpoint with rate limiting
     */
    @GetMapping("/directory")
    @FilterPrivateFields(fields = { "bio", "lastActive", "stats", "achievements" })
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getPublicProfiles(
            HttpServletRequest httpRequest) {

        // Requester identity comes from the verified token, never from client parameters
        String requesterId = currentUser.currentUserId().orElse(null);

        List<ProfileResponse> profiles = profileService.getPublicProfiles(requesterId);
        return ResponseEntity.ok(ApiResponse.success(profiles));
    }

    /**
     * Update privacy settings
     * Requires profile ownership
     */
    @PutMapping("/{userId}/privacy")
    public ResponseEntity<ApiResponse<Void>> updatePrivacySettings(
            @PathVariable String userId,
            @Valid @RequestBody UpdatePrivacyRequest request,
            HttpServletRequest httpRequest) {

        // Requester identity comes from the verified token, never from client parameters
        String requesterId = currentUser.currentUserId().orElse(null);

        profileService.updatePrivacySettings(userId, request, requesterId);
        return ResponseEntity.ok(ApiResponse.successMessage("Privacy settings updated successfully"));
    }

    /**
     * Update last active timestamp
     * Requires profile ownership
     */
    @PostMapping("/{userId}/activity")
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