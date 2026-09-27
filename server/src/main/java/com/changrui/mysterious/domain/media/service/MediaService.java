package com.changrui.mysterious.domain.media.service;

import com.changrui.mysterious.domain.media.model.MediaUploadResult;
import com.changrui.mysterious.shared.util.ImageUtils;
import java.awt.Dimension;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service to manage media uploads and file handling.
 * Uses standard NIO and structured logging.
 */

@Service
public class MediaService {

    private static final Logger log = LoggerFactory.getLogger(MediaService.class);

    @Value("${app.media.upload-dir:uploads/media}")
    private String uploadDir;

    @Value("${app.media.max-file-size:5242880}") // 5MB default
    private long maxFileSize;

    @Value("${app.media.max-width:4096}")
    private int maxWidth;

    @Value("${app.media.max-height:4096}")
    private int maxHeight;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp");

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp");

    /**
     * Upload an image file.
     */
    public MediaUploadResult uploadImage(MultipartFile file) throws IOException {
        validateFile(file);

        // Validate dimensions from the header before writing anything to disk
        ImageDimensions dims = validateImageDimensions(file);

        Path uploadPath = ensureUploadDirectory();

        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
        Path filePath = uploadPath.resolve(uniqueFilename);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        log.info("File saved: {}", filePath);

        String fileUrl = "/api/media/" + uniqueFilename;

        return new MediaUploadResult(
                fileUrl,
                originalFilename != null ? originalFilename : uniqueFilename,
                file.getSize(),
                file.getContentType(),
                dims.width,
                dims.height);
    }

    /**
     * Delete a media file.
     */
    public boolean deleteMedia(String filename) {
        try {
            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = basePath.resolve(filename).normalize();

            // Security check: ensure file is within upload directory
            if (!filePath.startsWith(basePath) || filePath.equals(basePath)) {
                log.warn("Delete denied for file path: {}", filePath);
                return false;
            }
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("Deleted media file: {}", filename);
            } else {
                log.warn("Media file not found for deletion: {}", filename);
            }
            return deleted;
        } catch (IOException e) {
            log.error("Error deleting file {}: {}", filename, e.getMessage());
            return false;
        }
    }

    /**
     * Get a media file safely.
     */
    public File getMediaFile(String filename) throws IOException {
        Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path filePath = basePath.resolve(filename).normalize();

        // Security check: ensure file is within upload directory
        if (!filePath.startsWith(basePath)) {
            log.warn("Access denied for file path: {}", filePath);
            throw new IOException("Access denied");
        }

        if (!Files.exists(filePath)) {
            log.warn("File not found: {}", filename);
            throw new IOException("File not found");
        }

        return filePath.toFile();
    }

    // --- Private Helpers ---

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                    String.format("File too large. Max: %d bytes, Actual: %d bytes", maxFileSize, file.getSize()));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported file type. Allowed: " + String.join(", ", ALLOWED_MIME_TYPES));
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid filename");
        }

        String extension = getFileExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported extension. Allowed: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }

    private Path ensureUploadDirectory() throws IOException {
        Path path = Paths.get(uploadDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            log.info("Created upload directory: {}", path);
        }
        return path;
    }

    private ImageDimensions validateImageDimensions(MultipartFile file) throws IOException {
        Dimension dims;
        try (InputStream in = file.getInputStream()) {
            dims = ImageUtils.readDimensions(in);
        } catch (IOException e) {
            log.warn("Failed to read image dimensions for {}: {}", file.getOriginalFilename(), e.getMessage());
            throw new IllegalArgumentException("File is not a valid image");
        }

        if (dims == null) {
            throw new IllegalArgumentException("File is not a valid image");
        }

        if (dims.width > maxWidth || dims.height > maxHeight) {
            log.warn("Image rejected due to dimensions: {}x{}. Max: {}x{}", dims.width, dims.height, maxWidth,
                    maxHeight);
            throw new IllegalArgumentException(
                    String.format("Dimensions too large. Max: %dx%dpx, Actual: %dx%dpx",
                            maxWidth, maxHeight, dims.width, dims.height));
        }

        return new ImageDimensions(dims.width, dims.height);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    private record ImageDimensions(Integer width, Integer height) {
    }
}