package com.changrui.mysterious.domain.profile.service;

import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import com.changrui.mysterious.shared.exception.NotFoundException;
import com.changrui.mysterious.shared.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

/**
 * Service for managing user avatars.
 * Currently handles avatar URLs. File upload functionality can be added later.
 */
@Service
public class AvatarService {

    @Autowired
    private UserProfileRepository profileRepository;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Update user avatar URL
     */
    @Transactional
    public void updateAvatarUrl(String userId, String avatarUrl, String requesterId) {
        // Check ownership
        if (!userId.equals(requesterId)) {
            throw new BadRequestException("Cannot update another user's avatar");
        }

        UserProfile profile = profileRepository.findByUserId(userId)
            .orElseThrow(() -> new NotFoundException("Profile not found for user: " + userId));

        profile.setAvatarUrl(avatarUrl);
        profileRepository.save(profile);
    }

    /**
     * Delete user avatar
     */
    @Transactional
    public void deleteAvatar(String userId, String requesterId) {
        // Check ownership
        if (!userId.equals(requesterId)) {
            throw new BadRequestException("Cannot delete another user's avatar");
        }

        UserProfile profile = profileRepository.findByUserId(userId)
            .orElseThrow(() -> new NotFoundException("Profile not found for user: " + userId));

        profile.setAvatarUrl(null);
        profileRepository.save(profile);
    }

    /**
     * Get default avatar options
     */
    public List<String> getDefaultAvatars() {
        // Return a list of default avatar URLs
        // These could be stored in the database or configuration
        return Arrays.asList(
            "/avatars/default/avatar1.png",
            "/avatars/default/avatar2.png",
            "/avatars/default/avatar3.png",
            "/avatars/default/avatar4.png",
            "/avatars/default/avatar5.png"
        );
    }

    /**
     * Validate file for avatar upload (for future file upload functionality)
     */
    public void validateAvatarFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Avatar file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Avatar file size must not exceed 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BadRequestException("Invalid file name");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Avatar must be a JPEG, PNG, or WebP image");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Avatar must be an image file");
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    // TODO: Implement file upload functionality
    // public String uploadAvatar(String userId, MultipartFile file) {
    //     validateAvatarFile(file);
    //     // Process and save file
    //     // Resize to 256x256
    //     // Save to storage (local, S3, etc.)
    //     // Return URL
    // }
}