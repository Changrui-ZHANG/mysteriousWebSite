package com.changrui.mysterious.shared.security;

import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.exception.UnauthenticatedException;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import com.changrui.mysterious.shared.security.TokenService.Identity;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

/**
 * Access to the identity verified by TokenInterceptor for the current request.
 * Client-supplied userId/requesterId values must be checked against it.
 */
@Component
@RequiredArgsConstructor
public class CurrentUser {

    public static final String ATTRIBUTE = "auth.identity";

    private final AdminService adminService;

    /**
     * Identity stored on a servlet request (for interceptors / advices).
     */
    public static Optional<Identity> fromRequest(HttpServletRequest request) {
        return Optional.ofNullable((Identity) request.getAttribute(ATTRIBUTE));
    }

    public Optional<Identity> current() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return Optional.empty();
        }
        return Optional.ofNullable((Identity) attributes.getAttribute(ATTRIBUTE, RequestAttributes.SCOPE_REQUEST));
    }

    public Optional<String> currentUserId() {
        return current().map(Identity::userId);
    }

    /**
     * Identity of the caller (guest or registered); 401 if absent.
     */
    public Identity requireUser() {
        return current().orElseThrow(() -> new UnauthenticatedException("Authentication required"));
    }

    /**
     * Caller must be claimedUserId (guests allowed). Returns the verified id.
     */
    public String requireSelf(String claimedUserId) {
        Identity identity = requireUser();
        if (!identity.userId().equals(claimedUserId)) {
            throw new UnauthorizedException("You can only act as yourself");
        }
        return identity.userId();
    }

    /**
     * Caller must be the registered (non-guest) user claimedUserId. Returns the verified id.
     */
    public String requireRegisteredSelf(String claimedUserId) {
        if (requireUser().guest()) {
            throw new UnauthorizedException("A registered account is required");
        }
        return requireSelf(claimedUserId);
    }

    /**
     * Caller must be claimedUserId unless adminCode is a valid admin code.
     */
    public void requireSelfOrAdmin(String claimedUserId, String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            requireSelf(claimedUserId);
        }
    }
}
