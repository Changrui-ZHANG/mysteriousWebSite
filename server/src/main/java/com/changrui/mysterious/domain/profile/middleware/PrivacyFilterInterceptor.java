package com.changrui.mysterious.domain.profile.middleware;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/**
 * Interceptor for privacy filtering on profile endpoints.
 * Automatically applies privacy rules and logs access attempts.
 */
@Component
public class PrivacyFilterInterceptor implements HandlerInterceptor {

    @Autowired
    private PrivacyFilterMiddleware privacyFilterMiddleware;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        // Extract profile user ID from path
        String profileUserId = extractProfileUserId(request);
        if (profileUserId == null) {
            return true; // Continue if no profile ID in path
        }

        // Extract requester information
        String requesterId = extractRequesterId(request);
        String adminCode = request.getHeader("X-Admin-Code");
        String operation = determineOperation(request);

        try {
            // Validate the operation
            privacyFilterMiddleware.validateOperation(profileUserId, requesterId, operation, adminCode);

            // Store privacy context for use in controller
            request.setAttribute("profileUserId", profileUserId);
            request.setAttribute("requesterId", requesterId);
            request.setAttribute("adminCode", adminCode);
            request.setAttribute("operation", operation);

            // Determine and store privacy level
            PrivacyFilterMiddleware.PrivacyLevel privacyLevel = privacyFilterMiddleware
                    .determinePrivacyLevel(profileUserId, requesterId, adminCode);
            request.setAttribute("privacyLevel", privacyLevel);

            // Log the access attempt
            privacyFilterMiddleware.logPrivacyAccess(operation, profileUserId, requesterId, privacyLevel, "request",
                    true);

            return true; // Continue to controller

        } catch (Exception e) {
            // Log failed access attempt
            privacyFilterMiddleware.logPrivacyAccess(operation, profileUserId, requesterId,
                    PrivacyFilterMiddleware.PrivacyLevel.DENIED, "request", false);
            throw e; // Re-throw to be handled by exception handler
        }
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response,
            Object handler, ModelAndView modelAndView) throws Exception {
        // Log successful response
        String profileUserId = (String) request.getAttribute("profileUserId");
        String requesterId = (String) request.getAttribute("requesterId");
        String operation = (String) request.getAttribute("operation");
        PrivacyFilterMiddleware.PrivacyLevel privacyLevel = (PrivacyFilterMiddleware.PrivacyLevel) request
                .getAttribute("privacyLevel");

        if (profileUserId != null && response.getStatus() < 400) {
            privacyFilterMiddleware.logPrivacyAccess(operation, profileUserId, requesterId,
                    privacyLevel, "response", true);
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
            Object handler, Exception ex) throws Exception {
        // Log any exceptions that occurred
        if (ex != null) {
            String profileUserId = (String) request.getAttribute("profileUserId");
            String requesterId = (String) request.getAttribute("requesterId");
            String operation = (String) request.getAttribute("operation");

            if (profileUserId != null) {
                privacyFilterMiddleware.logPrivacyAccess(operation, profileUserId, requesterId,
                        PrivacyFilterMiddleware.PrivacyLevel.DENIED, "exception", false);
            }
        }
    }

    /**
     * Extract profile user ID from request path.
     */
    private String extractProfileUserId(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Handle different profile endpoint patterns
        if (path.matches(".*/api/profiles/[^/]+/?.*")) {
            String[] pathParts = path.split("/");
            for (int i = 0; i < pathParts.length; i++) {
                if ("profiles".equals(pathParts[i]) && i + 1 < pathParts.length) {
                    String userId = pathParts[i + 1];
                    // Skip special endpoints that don't represent user IDs
                    if ("search".equals(userId) || "directory".equals(userId)) {
                        return null;
                    }
                    return userId;
                }
            }
        }

        // Handle avatar endpoints
        if (path.matches(".*/api/avatars/[^/]+/?.*")) {
            String[] pathParts = path.split("/");
            for (int i = 0; i < pathParts.length; i++) {
                if ("avatars".equals(pathParts[i]) && i + 1 < pathParts.length) {
                    String userId = pathParts[i + 1];
                    // Skip special endpoints that don't represent user IDs
                    if ("defaults".equals(userId) || "files".equals(userId)) {
                        return null;
                    }
                    return userId;
                }
            }
        }

        return null;
    }

    /**
     * Extract requester ID from request parameters or headers.
     */
    private String extractRequesterId(HttpServletRequest request) {
        // Try request parameter first
        String requesterId = request.getParameter("requesterId");

        if (requesterId == null || requesterId.trim().isEmpty()) {
            // Try header as fallback
            requesterId = request.getHeader("X-Requester-Id");
        }

        return (requesterId != null && !requesterId.trim().isEmpty()) ? requesterId.trim() : null;
    }

    /**
     * Determine the operation being performed based on HTTP method and path.
     */
    private String determineOperation(HttpServletRequest request) {
        String method = request.getMethod().toUpperCase();
        String path = request.getRequestURI();

        // Admin endpoints
        if (path.contains("/admin/")) {
            return method.equals("GET") ? "admin_view" : "admin_modify";
        }

        // Regular operations
        switch (method) {
            case "GET":
                return "read";
            case "POST":
                return path.contains("upload") ? "upload" : "create";
            case "PUT":
            case "PATCH":
                return "update";
            case "DELETE":
                return "delete";
            default:
                return "unknown";
        }
    }
}