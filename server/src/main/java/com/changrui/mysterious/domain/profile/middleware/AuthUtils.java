package com.changrui.mysterious.domain.profile.middleware;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Utility class for authentication-related operations.
 */
public class AuthUtils {

    /**
     * Extract requester ID from request parameters or headers.
     * 
     * @param request The HTTP request
     * @return The requester ID if found, null otherwise
     */
    public static String extractRequesterId(HttpServletRequest request) {
        // Try to get from request parameter first
        String requesterId = request.getParameter("requesterId");
        
        if (requesterId == null || requesterId.trim().isEmpty()) {
            // Try to get from header as fallback
            requesterId = request.getHeader("X-Requester-Id");
        }
        
        return (requesterId != null && !requesterId.trim().isEmpty()) ? requesterId.trim() : null;
    }

    /**
     * Extract admin code from request headers.
     * 
     * @param request The HTTP request
     * @return The admin code if found, null otherwise
     */
    public static String extractAdminCode(HttpServletRequest request) {
        String adminCode = request.getHeader("X-Admin-Code");
        return (adminCode != null && !adminCode.trim().isEmpty()) ? adminCode.trim() : null;
    }

    /**
     * Extract user ID from the request path.
     * Supports patterns like /api/profiles/{userId} or /api/profiles/{userId}/...
     * 
     * @param requestURI The request URI
     * @return The user ID if found, null otherwise
     */
    public static String extractUserIdFromPath(String requestURI) {
        if (requestURI.startsWith("/api/profiles/")) {
            String[] parts = requestURI.split("/");
            if (parts.length >= 4 && !"search".equals(parts[3]) && !"directory".equals(parts[3])) {
                return parts[3]; // The userId part
            }
        }
        return null;
    }

    /**
     * Check if the request is for a public endpoint that doesn't require authentication.
     * 
     * @param method The HTTP method
     * @param requestURI The request URI
     * @return true if the endpoint is public
     */
    public static boolean isPublicEndpoint(String method, String requestURI) {
        // OPTIONS requests are always public (CORS preflight)
        if ("OPTIONS".equals(method)) {
            return true;
        }

        // Basic profile info endpoint is public
        if (requestURI.matches("/api/profiles/[^/]+/basic")) {
            return true;
        }

        // Public directory endpoint (GET only)
        if ("GET".equals(method) && requestURI.equals("/api/profiles/directory")) {
            return true;
        }

        // Profile search endpoint (GET only)
        if ("GET".equals(method) && requestURI.startsWith("/api/profiles/search")) {
            return true;
        }

        // Profile view endpoint (GET only) - public but privacy rules apply
        if ("GET".equals(method) && requestURI.matches("/api/profiles/[^/]+/?$")) {
            return true;
        }

        return false;
    }

    /**
     * Determine if an operation requires profile ownership.
     * 
     * @param method The HTTP method
     * @param requestURI The request URI
     * @return true if ownership is required
     */
    public static boolean requiresOwnership(String method, String requestURI) {
        // GET requests for viewing profiles don't require ownership (but privacy rules apply)
        if ("GET".equals(method) && requestURI.matches("/api/profiles/[^/]+/?$")) {
            return false;
        }
        
        // All modification operations require ownership
        return "PUT".equals(method) || "DELETE".equals(method) || "POST".equals(method);
    }

    /**
     * Sanitize and validate a user ID.
     * 
     * @param userId The user ID to validate
     * @return The sanitized user ID
     * @throws IllegalArgumentException if the user ID is invalid
     */
    public static String validateUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        String sanitized = userId.trim();
        
        // Basic validation - adjust as needed based on your user ID format
        if (sanitized.length() > 255) {
            throw new IllegalArgumentException("User ID too long");
        }
        
        // Check for potentially dangerous characters
        if (sanitized.contains("..") || sanitized.contains("/") || sanitized.contains("\\")) {
            throw new IllegalArgumentException("User ID contains invalid characters");
        }
        
        return sanitized;
    }
}