package com.changrui.mysterious.domain.profile.service;

import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import com.changrui.mysterious.shared.exception.NotFoundException;
import com.changrui.mysterious.shared.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing user avatars.
 * Currently handles avatar URLs. File upload functionality can be added later.
 */
@Service
public class AvatarService {

    @Autowired
    private UserProfileRepository profileRepository;

    @Value("${app.avatar.upload-dir:uploads/avatars}")
    private String uploadDir;

    @Value("${app.avatar.base-url:/api/avatars/files}")
    private String baseUrl;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Upload and process avatar file
     */
    @Transactional
    public String uploadAvatar(String userId, MultipartFile file, String requesterId) {
        // Check ownership
        if (!userId.equals(requesterId)) {
            throw new BadRequestException("Cannot upload avatar for another user");
        }

        // Validate file
        validateAvatarFile(file);

        try {
            // Process and resize image
            BufferedImage processedImage = processAvatarImage(file);
            
            // Generate unique filename
            String filename = userId + "_" + UUID.randomUUID().toString() + ".jpg";
            
            // Ensure upload directory exists
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            
            // Save processed image
            Path filePath = uploadPath.resolve(filename);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(processedImage, "jpg", baos);
            Files.write(filePath, baos.toByteArray());
            
            // Generate URL
            String avatarUrl = baseUrl + "/" + filename;
            
            // Update profile with new avatar URL
            updateAvatarUrl(userId, avatarUrl, requesterId);
            
            return avatarUrl;
            
        } catch (IOException e) {
            throw new BadRequestException("Failed to process avatar image: " + e.getMessage());
        }
    }

    /**
     * Process and resize avatar image to 256x256
     */
    private BufferedImage processAvatarImage(MultipartFile file) throws IOException {
        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
        
        if (originalImage == null) {
            throw new BadRequestException("Invalid image file");
        }
        
        // Create 256x256 image
        BufferedImage resizedImage = new BufferedImage(256, 256, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resizedImage.createGraphics();
        
        // Enable high-quality rendering
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // Fill background with white
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, 256, 256);
        
        // Calculate scaling to maintain aspect ratio
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        double scale = Math.min(256.0 / originalWidth, 256.0 / originalHeight);
        
        int scaledWidth = (int) (originalWidth * scale);
        int scaledHeight = (int) (originalHeight * scale);
        
        // Center the image
        int x = (256 - scaledWidth) / 2;
        int y = (256 - scaledHeight) / 2;
        
        // Draw the scaled image
        g2d.drawImage(originalImage, x, y, scaledWidth, scaledHeight, null);
        g2d.dispose();
        
        return resizedImage;
    }

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
}