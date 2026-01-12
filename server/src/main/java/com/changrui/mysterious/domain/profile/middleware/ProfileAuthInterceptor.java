package com.changrui.mysterious.domain.profile.middleware;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor that automatically applies profile authentication middleware
 * to profile-related endpoints.
 */
@Component
public class ProfileAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private ProfileAuthMiddleware authMiddleware;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        // Skip authentication for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equals(method)) {
            return true;
        }

        // Skip authentication for basic profile info endpoint (used by message wall)
        if (requestURI.matches("/api/profiles/[^/]+/basic")) {
            return true;
        }

        // Skip authentication for public directory endpoint (GET only)
        if ("GET".equals(method) && requestURI.equals("/api/profiles/directory")) {
            return true;
        }

        // Extract user ID from path for profile-specific endpoints
        String userId = extractUserIdFromPath(requestURI);
        String requesterId = authMiddleware.extractRequesterId(request);

        // Apply authentication based on endpoint and method
        if (userId != null) {
            // Profile-specific endpoints
            boolean requireOwnership = requiresOwnership(method, requestURI);
            
            // Log the access attempt
            authMiddleware.logSecurityEvent(
                method + " " + requestURI, 
                userId, 
                requesterId, 
                true // We'll update this to false if auth fails
            );
            
            // Apply rate limiting
            if (requesterId != null) {
                String operation = determineOperation(method, requestURI);
                authMiddleware.verifyRateLimit(requesterId, operation);
            }
            
            // Verify access
            // First check if admin access was already granted by PrivacyFilterInterceptor
            String adminCode = request.getHeader("X-Admin-Code");
            if (adminCode != null && !adminCode.trim().isEmpty()) {
                try {
                    authMiddleware.verifyAdminAccess(request);
                    // Admin access granted, skip further checks
                    return true;
                } catch (Exception e) {
                    // Admin access failed, continue with normal checks
                }
            }
            
            authMiddleware.verifyProfileAccess(userId, requesterId, requireOwnership);
        } else {
            // General endpoints (search, directory)
            if (requesterId != null) {
                String operation = determineOperation(method, requestURI);
                authMiddleware.verifyRateLimit(requesterId, operation);
            }
        }

        return true;
    }

    /**
     * Extract user ID from the request path.
     * 
     * @param requestURI The request URI
     * @return The user ID if found, null otherwise
     */
    private String extractUserIdFromPath(String requestURI) {
        // Pattern: /api/profiles/{userId} or /api/profiles/{userId}/...
        if (requestURI.startsWith("/api/profiles/")) {
            String[] parts = requestURI.split("/");
            if (parts.length >= 4 && !"search".equals(parts[3]) && !"directory".equals(parts[3])) {
                return parts[3]; // The userId part
            }
        }
        return null;
    }

    /**
     * Determine if the operation requires ownership.
     * 
     * @param method The HTTP method
     * @param requestURI The request URI
     * @return true if ownership is required
     */
    private boolean requiresOwnership(String method, String requestURI) {
        // GET requests for viewing profiles don't require ownership
        if ("GET".equals(method) && requestURI.matches("/api/profiles/[^/]+/?$")) {
            return false;
        }
        
        // All other operations require ownership
        return "PUT".equals(method) || "DELETE".equals(method) || "POST".equals(method);
    }

    /**
     * Determine the operation type for rate limiting.
     * 
     * @param method The HTTP method
     * @param requestURI The request URI
     * @return The operation type
     */
    private String determineOperation(String method, String requestURI) {
        if (requestURI.contains("/avatar")) {
            return "avatar_upload";
        } else if (requestURI.contains("/privacy")) {
            return "privacy_update";
        } else if (requestURI.contains("/search")) {
            return "profile_search";
        } else if (requestURI.contains("/directory")) {
            return "directory_access";
        } else if ("PUT".equals(method)) {
            return "profile_update";
        } else if ("POST".equals(method)) {
            return "profile_create";
        } else if ("DELETE".equals(method)) {
            return "profile_delete";
        } else {
            return "profile_view";
        }
    }
}