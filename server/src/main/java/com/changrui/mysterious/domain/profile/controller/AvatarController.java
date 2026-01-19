package com.changrui.mysterious.domain.profile.controller;

import com.changrui.mysterious.domain.profile.middleware.RequireProfileOwnership;
import com.changrui.mysterious.domain.profile.middleware.SecureFileUpload;
import com.changrui.mysterious.domain.profile.middleware.ValidateFileUpload;
import com.changrui.mysterious.domain.profile.service.AvatarService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller for avatar management.
 * REST endpoints for avatar operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/avatars")
public class AvatarController {

    @Value("${app.avatar.upload-dir:uploads/avatars}")
    private String uploadDir;

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
        return ResponseEntity.ok(ApiResponse.success("Avatar uploaded successfully", avatarUrl));
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

            // Use the configured upload directory
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();

            log.debug("Serving avatar from path: {}", filePath.toAbsolutePath());

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
                log.warn("Avatar file not found or not readable: {}", filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error serving avatar file: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}