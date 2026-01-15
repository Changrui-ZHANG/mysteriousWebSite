package com.changrui.mysterious.domain.profile.controller;

import com.changrui.mysterious.domain.profile.middleware.RequireProfileOwnership;
import com.changrui.mysterious.domain.profile.middleware.SecureFileUpload;
import com.changrui.mysterious.domain.profile.middleware.ValidateFileUpload;
import com.changrui.mysterious.domain.profile.service.AvatarService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
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
     * Upload avatar file
     */
    @PostMapping("/{userId}")
    @SecureFileUpload(operation = "avatar_upload", maxFiles = 1)
    @RequireProfileOwnership
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @PathVariable String userId,
            @RequestParam("avatar") @ValidateFileUpload(fileType = "avatar", maxSize = 5242880) MultipartFile file,
            @RequestParam String requesterId) {

        String avatarUrl = avatarService.uploadAvatar(userId, file, requesterId);
        return ResponseEntity.ok(ApiResponse.success(avatarUrl, "Avatar uploaded successfully"));
    }

    /**
     * Update user avatar URL
     */
    @PutMapping("/{userId}")
    @RequireProfileOwnership
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
    @RequireProfileOwnership
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

    /**
     * Serve avatar files from the uploads directory
     */
    @GetMapping("/files/{filename}")
    public ResponseEntity<Resource> serveAvatarFile(@PathVariable String filename) {
        try {
            // Basic security check for filename to prevent path traversal
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest().build();
            }

            Path filePath = Paths.get("uploads/avatars").resolve(filename);
            System.out.println("[DEBUG] Retrieving avatar from: " + filePath.toAbsolutePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                MediaType mediaType = MediaType.IMAGE_JPEG;
                if (filename.toLowerCase().endsWith(".png")) {
                    mediaType = MediaType.IMAGE_PNG;
                } else if (filename.toLowerCase().endsWith(".webp")) {
                    mediaType = MediaType.parseMediaType("image/webp");
                }

                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}