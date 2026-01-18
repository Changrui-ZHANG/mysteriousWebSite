package com.changrui.mysterious.domain.profile.middleware;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.HandlerInterceptor;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;

import java.util.Map;

/**
 * Interceptor for file upload security validation.
 * Automatically validates uploaded files before they reach the controller.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FileUploadInterceptor implements HandlerInterceptor {

    private final FileUploadMiddleware fileUploadMiddleware;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        // Only process multipart requests (file uploads)
        if (!(request instanceof MultipartHttpServletRequest)) {
            return true; // Continue with non-file requests
        }

        MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;

        // Validate all uploaded files
        Map<String, MultipartFile> fileMap = multipartRequest.getFileMap();

        for (Map.Entry<String, MultipartFile> entry : fileMap.entrySet()) {
            String fieldName = entry.getKey();
            MultipartFile file = entry.getValue();

            if (file != null && !file.isEmpty()) {
                // Determine file type based on endpoint and field name
                String fileType = determineFileType(request.getRequestURI(), fieldName);

                // Validate the file
                fileUploadMiddleware.validateUploadedFile(file, fileType);

                // Log security event
                logFileUploadAttempt(request, file, true);
            }
        }

        return true; // Continue to controller
    }

    /**
     * Determine the expected file type based on the request URI and field name.
     */
    private String determineFileType(String requestURI, String fieldName) {
        // Avatar upload endpoints
        if (requestURI.contains("/api/avatars") || fieldName.equals("avatar")) {
            return "avatar";
        }

        // Profile image uploads
        if (requestURI.contains("/api/profiles") && fieldName.contains("image")) {
            return "image";
        }

        // Default to image for now (can be extended for other file types)
        return "image";
    }

    /**
     * Log file upload attempts for security auditing.
     */
    private void logFileUploadAttempt(HttpServletRequest request, MultipartFile file, boolean success) {
        String clientIP = getClientIP(request);
        String userAgent = request.getHeader("User-Agent");
        String requesterId = request.getParameter("requesterId");

        String logMessage = String.format(
                "File Upload: %s | IP: %s | User: %s | File: %s (%d bytes) | Success: %s",
                request.getRequestURI(), clientIP, requesterId,
                file.getOriginalFilename(), file.getSize(), success);

        // In production, this would go to a security audit log
        log.debug("File Upload: {} | IP: {} | User: {} | File: {} ({} bytes) | Success: {}",
                request.getRequestURI(), clientIP, requesterId, file.getOriginalFilename(), file.getSize(), success);
    }

    /**
     * Get client IP address, handling proxy headers.
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }

        return request.getRemoteAddr();
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
            Object handler, Exception ex) throws Exception {
        // Log any exceptions that occurred during file processing
        if (ex != null && request instanceof MultipartHttpServletRequest) {
            String clientIP = getClientIP(request);
            String requesterId = request.getParameter("requesterId");

            String errorLog = String.format(
                    "File Upload Error: %s | IP: %s | User: %s | Error: %s",
                    request.getRequestURI(), clientIP, requesterId, ex.getMessage());

            log.warn("File Upload Error: {} | IP: {} | User: {} | Error: {}",
                    request.getRequestURI(), clientIP, requesterId, ex.getMessage());
        }
    }
}