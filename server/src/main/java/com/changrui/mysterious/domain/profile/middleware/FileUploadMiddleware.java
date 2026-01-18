package com.changrui.mysterious.domain.profile.middleware;

import com.changrui.mysterious.shared.exception.BadRequestException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import javax.imageio.ImageIO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Middleware for secure file upload handling.
 * Provides file validation, security checks, and malware scanning for uploaded
 * files.
 */
@Slf4j
@Component
public class FileUploadMiddleware {

    @Value("${app.upload.max-file-size:5242880}") // 5MB default
    private long maxFileSize;

    @Value("${app.upload.allowed-image-types:jpg,jpeg,png,webp}")
    private String allowedImageTypes;

    @Value("${app.upload.max-image-dimension:4096}")
    private int maxImageDimension;

    @Value("${app.upload.enable-malware-scan:false}")
    private boolean enableMalwareScanning;

    private static final List<String> DANGEROUS_EXTENSIONS = Arrays.asList(
            "exe", "bat", "cmd", "com", "pif", "scr", "vbs", "js", "jar", "php", "asp", "jsp");

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    /**
     * Validate uploaded file for security and format compliance.
     * 
     * @param file     The uploaded file to validate
     * @param fileType The expected file type (e.g., "avatar", "document")
     * @throws BadRequestException if validation fails
     */
    public void validateUploadedFile(MultipartFile file, String fileType) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        // Basic file validation
        validateFileSize(file);
        validateFileName(file);
        validateMimeType(file);

        // Type-specific validation
        switch (fileType.toLowerCase()) {
            case "avatar":
            case "image":
                validateImageFile(file);
                break;
            default:
                throw new BadRequestException("Unsupported file type: " + fileType);
        }

        // Security checks
        performSecurityChecks(file);
    }

    /**
     * Validate file size against configured limits.
     */
    private void validateFileSize(MultipartFile file) {
        if (file.getSize() > maxFileSize) {
            throw new BadRequestException(
                    String.format("File size exceeds maximum allowed size of %d bytes", maxFileSize));
        }

        if (file.getSize() == 0) {
            throw new BadRequestException("File is empty");
        }
    }

    /**
     * Validate file name for security issues.
     */
    private void validateFileName(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new BadRequestException("Invalid file name");
        }

        // Sanitize filename
        String sanitizedName = sanitizeFileName(originalFilename);
        if (sanitizedName.isEmpty()) {
            throw new BadRequestException("File name contains only invalid characters");
        }

        // Check for dangerous extensions
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (DANGEROUS_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("File type not allowed for security reasons");
        }

        // Check for path traversal attempts
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BadRequestException("Invalid file name: path traversal detected");
        }
    }

    /**
     * Validate MIME type against allowed types.
     */
    private void validateMimeType(MultipartFile file) {
        String contentType = file.getContentType();

        if (contentType == null) {
            throw new BadRequestException("File content type is required");
        }

        if (!ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("File type not allowed: " + contentType);
        }
    }

    /**
     * Validate image-specific properties.
     */
    private void validateImageFile(MultipartFile file) {
        try {
            // Verify it's actually an image by trying to read it
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(file.getBytes()));

            if (image == null) {
                throw new BadRequestException("File is not a valid image");
            }

            // Check image dimensions
            if (image.getWidth() > maxImageDimension || image.getHeight() > maxImageDimension) {
                throw new BadRequestException(
                        String.format("Image dimensions exceed maximum allowed size of %dx%d pixels",
                                maxImageDimension, maxImageDimension));
            }

            // Check for minimum dimensions (avoid tiny images)
            if (image.getWidth() < 32 || image.getHeight() < 32) {
                throw new BadRequestException("Image is too small (minimum 32x32 pixels)");
            }

            // Validate file extension matches content
            String extension = getFileExtension(file.getOriginalFilename()).toLowerCase();
            List<String> allowedExtensions = Arrays.asList(allowedImageTypes.split(","));

            if (!allowedExtensions.contains(extension)) {
                throw new BadRequestException("Image file extension not allowed: " + extension);
            }

        } catch (IOException e) {
            throw new BadRequestException("Failed to process image file: " + e.getMessage());
        }
    }

    /**
     * Perform security checks on uploaded file.
     */
    private void performSecurityChecks(MultipartFile file) {
        // Only check for embedded scripts in non-image files to avoid false positives
        // in binary data
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            checkForEmbeddedScripts(file);
        }

        // Placeholder for malware scanning
        if (enableMalwareScanning) {
            performMalwareScan(file);
        }

        // Check file header magic bytes
        validateFileHeader(file);
    }

    /**
     * Check for embedded scripts in file content.
     */
    private void checkForEmbeddedScripts(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            String content = new String(fileBytes).toLowerCase();

            // Check for common script patterns
            String[] dangerousPatterns = {
                    "<script", "javascript:", "vbscript:", "onload=", "onerror=",
                    "<?php", "<%", "<jsp:", "eval(", "exec("
            };

            for (String pattern : dangerousPatterns) {
                if (content.contains(pattern)) {
                    throw new BadRequestException("File contains potentially malicious content");
                }
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to scan file content");
        }
    }

    /**
     * Placeholder for malware scanning functionality.
     * In production, this would integrate with antivirus engines.
     */
    private void performMalwareScan(MultipartFile file) {
        // TODO: Integrate with malware scanning service
        // This is a placeholder for future implementation

        // Example integration points:
        // - ClamAV for open-source scanning
        // - VirusTotal API for cloud-based scanning
        // - Commercial antivirus solutions

        // For now, log that scanning would occur
        log.debug("Malware scan placeholder for file: {}", file.getOriginalFilename());

        // Simulate scan result (in production, this would be real)
        boolean scanResult = true; // Assume clean for placeholder

        if (!scanResult) {
            throw new BadRequestException("File failed malware scan");
        }
    }

    /**
     * Validate file header magic bytes to ensure file type matches extension.
     */
    private void validateFileHeader(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            if (fileBytes.length < 4) {
                throw new BadRequestException("File is too small to validate");
            }

            // Check magic bytes for common image formats
            String extension = getFileExtension(file.getOriginalFilename()).toLowerCase();

            switch (extension) {
                case "jpg":
                case "jpeg":
                    if (!(fileBytes[0] == (byte) 0xFF && fileBytes[1] == (byte) 0xD8)) {
                        throw new BadRequestException("File header does not match JPEG format");
                    }
                    break;
                case "png":
                    if (!(fileBytes[0] == (byte) 0x89 && fileBytes[1] == 0x50 &&
                            fileBytes[2] == 0x4E && fileBytes[3] == 0x47)) {
                        throw new BadRequestException("File header does not match PNG format");
                    }
                    break;
                case "webp":
                    if (!(fileBytes[0] == 0x52 && fileBytes[1] == 0x49 &&
                            fileBytes[2] == 0x46 && fileBytes[3] == 0x46)) {
                        throw new BadRequestException("File header does not match WebP format");
                    }
                    break;
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to validate file header");
        }
    }

    /**
     * Sanitize filename by removing dangerous characters.
     */
    public String sanitizeFileName(String filename) {
        if (filename == null) {
            return "";
        }

        // Remove path separators and dangerous characters
        return filename.replaceAll("[^a-zA-Z0-9._-]", "")
                .replaceAll("\\.{2,}", ".") // Remove multiple dots
                .trim();
    }

    /**
     * Get file extension from filename.
     */
    private String getFileExtension(String filename) {
        if (filename == null) {
            return "";
        }

        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    /**
     * Generate secure filename for storage.
     */
    public String generateSecureFilename(String originalFilename, String userId) {
        String extension = getFileExtension(originalFilename);
        String sanitizedName = sanitizeFileName(originalFilename);

        // Create secure filename with timestamp and user ID
        long timestamp = System.currentTimeMillis();
        return String.format("%s_%d_%s.%s", userId, timestamp,
                sanitizedName.replaceAll("\\.[^.]*$", ""), extension);
    }

    /**
     * Check if file type is allowed for the given operation.
     */
    public boolean isFileTypeAllowed(String filename, String operation) {
        String extension = getFileExtension(filename).toLowerCase();

        switch (operation.toLowerCase()) {
            case "avatar":
                return Arrays.asList(allowedImageTypes.split(",")).contains(extension);
            default:
                return false;
        }
    }
}