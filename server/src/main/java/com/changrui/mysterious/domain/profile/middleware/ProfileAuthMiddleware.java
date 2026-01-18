package com.changrui.mysterious.domain.profile.middleware;

import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import com.changrui.mysterious.shared.exception.NotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Middleware for profile authentication and authorization.
 * Handles profile ownership verification and privacy-aware access control.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProfileAuthMiddleware {

    private final UserProfileRepository profileRepository;
    private final AdminService adminService;

    /**
     * Verify that the requester can access the specified profile.
     * 
     * @param userId           The profile user ID being accessed
     * @param requesterId      The ID of the user making the request
     * @param requireOwnership Whether ownership is required for this operation
     * @throws UnauthorizedException if access is denied
     * @throws NotFoundException     if profile doesn't exist
     */
    public void verifyProfileAccess(String userId, String requesterId, boolean requireOwnership) {
        // Check if profile exists
        var profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found for user: " + userId));

        // If ownership is required, verify the requester is the owner
        if (requireOwnership) {
            if (requesterId == null || !requesterId.equals(userId)) {
                throw new UnauthorizedException("You can only access your own profile for this operation");
            }
            return;
        }

        // For read operations, check privacy settings
        if (requesterId != null && requesterId.equals(userId)) {
            // Owner can always access their own profile
            return;
        }

        // Check if profile is public
        if (!profile.isPublic()) {
            throw new UnauthorizedException("This profile is private");
        }
    }

    /**
     * Verify admin access using admin code from request headers.
     * 
     * @param request The HTTP request
     * @throws UnauthorizedException if admin access is denied
     */
    public void verifyAdminAccess(HttpServletRequest request) {
        String adminCode = request.getHeader("X-Admin-Code");

        if (adminCode == null || adminCode.trim().isEmpty()) {
            throw new UnauthorizedException("Admin access required");
        }

        try {
            adminService.validateAdminCode(adminCode.trim());
        } catch (SecurityException e) {
            throw new UnauthorizedException("Invalid admin credentials");
        }
    }

    /**
     * Verify super admin access using admin code from request headers.
     * 
     * @param request The HTTP request
     * @throws UnauthorizedException if super admin access is denied
     */
    public void verifySuperAdminAccess(HttpServletRequest request) {
        String adminCode = request.getHeader("X-Admin-Code");

        if (adminCode == null || adminCode.trim().isEmpty()) {
            throw new UnauthorizedException("Super admin access required");
        }

        try {
            adminService.validateSuperAdminCode(adminCode.trim());
        } catch (SecurityException e) {
            throw new UnauthorizedException("Invalid super admin credentials");
        }
    }

    /**
     * Extract and validate requester ID from request parameters or headers.
     * 
     * @param request The HTTP request
     * @return The validated requester ID, or null if not provided
     */
    public String extractRequesterId(HttpServletRequest request) {
        // Try to get from request parameter first
        String requesterId = request.getParameter("requesterId");

        if (requesterId == null || requesterId.trim().isEmpty()) {
            // Try to get from header as fallback
            requesterId = request.getHeader("X-Requester-Id");
        }

        return (requesterId != null && !requesterId.trim().isEmpty()) ? requesterId.trim() : null;
    }

    /**
     * Check if the requester has admin privileges.
     * 
     * @param request The HTTP request
     * @return true if requester is admin, false otherwise
     */
    public boolean isAdmin(HttpServletRequest request) {
        String adminCode = request.getHeader("X-Admin-Code");

        if (adminCode == null || adminCode.trim().isEmpty()) {
            return false;
        }

        return adminService.isValidAdminCode(adminCode.trim());
    }

    /**
     * Check if the requester has super admin privileges.
     * 
     * @param request The HTTP request
     * @return true if requester is super admin, false otherwise
     */
    public boolean isSuperAdmin(HttpServletRequest request) {
        String adminCode = request.getHeader("X-Admin-Code");

        if (adminCode == null || adminCode.trim().isEmpty()) {
            return false;
        }

        return adminService.isSuperAdmin(adminCode.trim());
    }

    /**
     * Verify rate limiting for profile operations.
     * This is a placeholder for future rate limiting implementation.
     * 
     * @param requesterId The ID of the user making the request
     * @param operation   The type of operation being performed
     */
    public void verifyRateLimit(String requesterId, String operation) {
        // TODO: Implement rate limiting logic
        // For now, this is a no-op but provides the structure for future implementation

        // Example rate limits that could be implemented:
        // - Profile updates: 10 per hour per user
        // - Avatar uploads: 5 per hour per user
        // - Profile searches: 100 per hour per user
        // - Directory access: 50 per hour per user
    }

    /**
     * Log security-related events for audit purposes.
     * 
     * @param event       The security event description
     * @param userId      The user ID involved
     * @param requesterId The requester ID
     * @param success     Whether the operation was successful
     */
    public void logSecurityEvent(String event, String userId, String requesterId, boolean success) {
        // TODO: Implement proper security logging
        // For now, this is a placeholder for future audit logging implementation

        String logMessage = String.format(
                "Security Event: %s | User: %s | Requester: %s | Success: %s",
                event, userId, requesterId, success);

        // In a production system, this would log to a security audit log
        log.debug("Security Event: {} | User: {} | Requester: {} | Success: {}", event, userId, requesterId, success);
    }
}