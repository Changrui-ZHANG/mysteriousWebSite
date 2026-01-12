package com.changrui.mysterious.domain.profile.controller;

import com.changrui.mysterious.domain.profile.service.AvatarService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for avatar management.
 * REST endpoints for avatar operations.
 */
@RestController
@RequestMapping("/api/avatars")
public class AvatarController {

    @Autowired
    private AvatarService avatarService;

    /**
     * Update user avatar URL
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> updateAvatarUrl(
            @PathVariable String userId,
            @RequestBody String avatarUrl,
            @RequestParam String requesterId) {
        
        avatarService.updateAvatarUrl(userId, avatarUrl, requesterId);
        return ResponseEntity.ok(ApiResponse.successMessage("Avatar updated successfully"));
    }

    /**
     * Delete user avatar
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteAvatar(
            @PathVariable String userId,
            @RequestParam String requesterId) {
        
        avatarService.deleteAvatar(userId, requesterId);
        return ResponseEntity.ok(ApiResponse.successMessage("Avatar deleted successfully"));
    }

    /**
     * Get default avatar options
     */
    @GetMapping("/defaults")
    public ResponseEntity<ApiResponse<List<String>>> getDefaultAvatars() {
        List<String> defaultAvatars = avatarService.getDefaultAvatars();
        return ResponseEntity.ok(ApiResponse.success(defaultAvatars));
    }

    // TODO: Add file upload endpoint
    // @PostMapping("/{userId}/upload")
    // public ResponseEntity<ApiResponse<String>> uploadAvatar(
    //         @PathVariable String userId,
    //         @RequestParam("file") MultipartFile file,
    //         @RequestParam String requesterId) {
    //     
    //     String avatarUrl = avatarService.uploadAvatar(userId, file);
    //     return ResponseEntity.ok(ApiResponse.success("Avatar uploaded successfully", avatarUrl));
    // }
}