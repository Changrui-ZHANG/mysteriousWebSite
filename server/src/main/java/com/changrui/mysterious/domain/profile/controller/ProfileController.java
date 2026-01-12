package com.changrui.mysterious.domain.profile.controller;

import com.changrui.mysterious.domain.profile.dto.*;
import com.changrui.mysterious.domain.profile.service.ProfileService;
import com.changrui.mysterious.domain.profile.service.ProfileIntegrationService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for user profile operations.
 * REST endpoints for profile management.
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
            @Valid @RequestBody CreateProfileRequest request) {
        
        ProfileResponse profile = profileService.createProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile created successfully", profile));
    }

    /**
     * Get user profile by ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @PathVariable String userId,
            @RequestParam(required = false) String requesterId) {
        
        ProfileResponse profile = profileService.getProfile(userId, requesterId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Update user profile
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @PathVariable String userId,
            @Valid @RequestBody UpdateProfileRequest request,
            @RequestParam String requesterId) {
        
        ProfileResponse profile = profileService.updateProfile(userId, request, requesterId);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    /**
     * Delete user profile
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @PathVariable String userId,
            @RequestParam String requesterId) {
        
        profileService.deleteProfile(userId, requesterId);
        return ResponseEntity.ok(ApiResponse.successMessage("Profile deleted successfully"));
    }

    /**
     * Search profiles
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> searchProfiles(
            @RequestParam String q,
            @RequestParam(required = false) String requesterId) {
        
        List<ProfileResponse> profiles = profileService.searchProfiles(q, requesterId);
        return ResponseEntity.ok(ApiResponse.success(profiles));
    }

    /**
     * Get public profiles directory
     */
    @GetMapping("/directory")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getPublicProfiles(
            @RequestParam(required = false) String requesterId) {
        
        List<ProfileResponse> profiles = profileService.getPublicProfiles(requesterId);
        return ResponseEntity.ok(ApiResponse.success(profiles));
    }

    /**
     * Update privacy settings
     */
    @PutMapping("/{userId}/privacy")
    public ResponseEntity<ApiResponse<Void>> updatePrivacySettings(
            @PathVariable String userId,
            @Valid @RequestBody UpdatePrivacyRequest request,
            @RequestParam String requesterId) {
        
        profileService.updatePrivacySettings(userId, request, requesterId);
        return ResponseEntity.ok(ApiResponse.successMessage("Privacy settings updated successfully"));
    }

    /**
     * Update last active timestamp
     */
    @PostMapping("/{userId}/activity")
    public ResponseEntity<ApiResponse<Void>> updateLastActive(@PathVariable String userId) {
        profileService.updateLastActive(userId);
        return ResponseEntity.ok(ApiResponse.successMessage("Last active updated"));
    }

    /**
     * Get basic profile info for message display (avatar, display name)
     */
    @GetMapping("/{userId}/basic")
    public ResponseEntity<ApiResponse<BasicProfileInfo>> getBasicProfileInfo(@PathVariable String userId) {
        var profile = profileIntegrationService.getProfileForMessage(userId);
        if (profile == null) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
        
        var basicInfo = new BasicProfileInfo(profile.getDisplayName(), profile.getAvatarUrl());
        return ResponseEntity.ok(ApiResponse.success(basicInfo));
    }
}