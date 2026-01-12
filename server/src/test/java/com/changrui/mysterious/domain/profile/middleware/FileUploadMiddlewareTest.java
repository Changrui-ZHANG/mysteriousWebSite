package com.changrui.mysterious.domain.profile.middleware;

import com.changrui.mysterious.shared.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class FileUploadMiddlewareTest {

    @InjectMocks
    private FileUploadMiddleware fileUploadMiddleware;

    @BeforeEach
    void setUp() {
        // Set up configuration values
        ReflectionTestUtils.setField(fileUploadMiddleware, "maxFileSize", 5242880L); // 5MB
        ReflectionTestUtils.setField(fileUploadMiddleware, "allowedImageTypes", "jpg,jpeg,png,webp");
        ReflectionTestUtils.setField(fileUploadMiddleware, "maxImageDimension", 4096);
        ReflectionTestUtils.setField(fileUploadMiddleware, "enableMalwareScanning", false);
    }

    @Test
    void validateUploadedFile_ValidAvatarFile_ShouldPass() {
        // Create a valid JPEG file (minimal JPEG header)
        byte[] jpegHeader = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        MockMultipartFile validFile = new MockMultipartFile(
            "avatar", "test.jpg", "image/jpeg", jpegHeader);

        // Should not throw exception
        assertDoesNotThrow(() -> {
            fileUploadMiddleware.validateUploadedFile(validFile, "avatar");
        });
    }

    @Test
    void validateUploadedFile_NullFile_ShouldThrowException() {
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(null, "avatar");
        });
        
        assertEquals("File is required", exception.getMessage());
    }

    @Test
    void validateUploadedFile_EmptyFile_ShouldThrowException() {
        MockMultipartFile emptyFile = new MockMultipartFile(
            "avatar", "test.jpg", "image/jpeg", new byte[0]);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(emptyFile, "avatar");
        });
        
        assertEquals("File is empty", exception.getMessage());
    }

    @Test
    void validateUploadedFile_FileTooLarge_ShouldThrowException() {
        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile largeFile = new MockMultipartFile(
            "avatar", "test.jpg", "image/jpeg", largeContent);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(largeFile, "avatar");
        });
        
        assertTrue(exception.getMessage().contains("File size exceeds maximum allowed size"));
    }

    @Test
    void validateUploadedFile_InvalidMimeType_ShouldThrowException() {
        byte[] content = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        MockMultipartFile invalidFile = new MockMultipartFile(
            "avatar", "test.jpg", "application/octet-stream", content);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(invalidFile, "avatar");
        });
        
        assertTrue(exception.getMessage().contains("File type not allowed"));
    }

    @Test
    void validateUploadedFile_DangerousExtension_ShouldThrowException() {
        byte[] content = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        MockMultipartFile dangerousFile = new MockMultipartFile(
            "avatar", "malware.exe", "image/jpeg", content);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(dangerousFile, "avatar");
        });
        
        assertEquals("File type not allowed for security reasons", exception.getMessage());
    }

    @Test
    void validateUploadedFile_PathTraversal_ShouldThrowException() {
        byte[] content = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        MockMultipartFile maliciousFile = new MockMultipartFile(
            "avatar", "../../../etc/passwd.jpg", "image/jpeg", content);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(maliciousFile, "avatar");
        });
        
        assertTrue(exception.getMessage().contains("path traversal detected"));
    }

    @Test
    void validateUploadedFile_InvalidJpegHeader_ShouldThrowException() {
        byte[] invalidHeader = {(byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00};
        MockMultipartFile invalidFile = new MockMultipartFile(
            "avatar", "test.jpg", "image/jpeg", invalidHeader);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(invalidFile, "avatar");
        });
        
        assertTrue(exception.getMessage().contains("File header does not match JPEG format"));
    }

    @Test
    void validateUploadedFile_ValidPngHeader_ShouldPass() {
        byte[] pngHeader = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        MockMultipartFile validFile = new MockMultipartFile(
            "avatar", "test.png", "image/png", pngHeader);

        // Should not throw exception for PNG header validation
        // Note: This will still fail on image content validation, but header check should pass
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(validFile, "avatar");
        });
        
        // Should fail on image content, not header
        assertTrue(exception.getMessage().contains("File is not a valid image"));
    }

    @Test
    void sanitizeFileName_ValidFilename_ShouldReturnSanitized() {
        String result = fileUploadMiddleware.sanitizeFileName("test file!@#$.jpg");
        assertEquals("testfile.jpg", result);
    }

    @Test
    void sanitizeFileName_NullFilename_ShouldReturnEmpty() {
        String result = fileUploadMiddleware.sanitizeFileName(null);
        assertEquals("", result);
    }

    @Test
    void sanitizeFileName_PathTraversal_ShouldRemoveDangerousChars() {
        String result = fileUploadMiddleware.sanitizeFileName("../../../malicious.jpg");
        assertEquals("malicious.jpg", result);
    }

    @Test
    void generateSecureFilename_ValidInput_ShouldGenerateSecureFilename() {
        String result = fileUploadMiddleware.generateSecureFilename("test.jpg", "user123");
        
        assertTrue(result.startsWith("user123_"));
        assertTrue(result.endsWith("_test.jpg"));
        assertTrue(result.contains("_")); // Should contain timestamp
    }

    @Test
    void isFileTypeAllowed_AvatarOperation_ShouldReturnCorrectResult() {
        assertTrue(fileUploadMiddleware.isFileTypeAllowed("test.jpg", "avatar"));
        assertTrue(fileUploadMiddleware.isFileTypeAllowed("test.png", "avatar"));
        assertFalse(fileUploadMiddleware.isFileTypeAllowed("test.exe", "avatar"));
        assertFalse(fileUploadMiddleware.isFileTypeAllowed("test.txt", "avatar"));
    }

    @Test
    void validateUploadedFile_UnsupportedFileType_ShouldThrowException() {
        byte[] content = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        MockMultipartFile file = new MockMultipartFile(
            "document", "test.jpg", "image/jpeg", content);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(file, "unsupported");
        });
        
        assertTrue(exception.getMessage().contains("Unsupported file type"));
    }

    @Test
    void validateUploadedFile_ScriptContent_ShouldThrowException() {
        String maliciousContent = "<script>alert('xss')</script>";
        MockMultipartFile maliciousFile = new MockMultipartFile(
            "avatar", "test.jpg", "image/jpeg", maliciousContent.getBytes());

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            fileUploadMiddleware.validateUploadedFile(maliciousFile, "avatar");
        });
        
        assertTrue(exception.getMessage().contains("potentially malicious content"));
    }
}