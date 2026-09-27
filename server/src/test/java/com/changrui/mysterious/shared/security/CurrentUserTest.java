package com.changrui.mysterious.shared.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.exception.UnauthenticatedException;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Unit tests for TokenInterceptor + CurrentUser.
 */
class CurrentUserTest {

    private final TokenService tokenService = new TokenService("test-secret", "super");
    private final TokenInterceptor interceptor = new TokenInterceptor(tokenService);
    private final AdminService adminService = mock(AdminService.class);
    private final CurrentUser currentUser = new CurrentUser(adminService);

    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        when(adminService.isValidAdminCode("admin")).thenReturn(true);
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    private void authenticate(String header) {
        if (header != null) {
            request.addHeader("Authorization", header);
        }
        assertTrue(interceptor.preHandle(request, new MockHttpServletResponse(), null));
    }

    @Test
    void validBearerTokenSetsIdentity() {
        authenticate("Bearer " + tokenService.issue("user-1", false));

        assertEquals("user-1", currentUser.currentUserId().orElseThrow());
        assertEquals("user-1", CurrentUser.fromRequest(request).orElseThrow().userId());
        assertEquals("user-1", currentUser.requireSelf("user-1"));
        assertEquals("user-1", currentUser.requireRegisteredSelf("user-1"));
    }

    @Test
    void missingOrInvalidTokenIsAnonymous() {
        authenticate(null);
        assertTrue(currentUser.current().isEmpty());

        authenticate("Bearer not-a-token");
        assertTrue(currentUser.current().isEmpty());
        assertThrows(UnauthenticatedException.class, currentUser::requireUser);
        assertThrows(UnauthenticatedException.class, () -> currentUser.requireSelf("user-1"));
    }

    @Test
    void mismatchedClaimIsForbidden() {
        authenticate("Bearer " + tokenService.issue("user-1", false));

        assertThrows(UnauthorizedException.class, () -> currentUser.requireSelf("user-2"));
        assertThrows(UnauthorizedException.class, () -> currentUser.requireSelf(null));
        assertThrows(UnauthorizedException.class, () -> currentUser.requireSelfOrAdmin("user-2", "wrong"));
    }

    @Test
    void adminCodeBypassesSelfCheck() {
        authenticate(null);
        assertDoesNotThrow(() -> currentUser.requireSelfOrAdmin("user-2", "admin"));
    }

    @Test
    void guestCanActAsItselfButNotAsRegisteredUser() {
        authenticate("Bearer " + tokenService.issue("user_1700000000000_abc", true));

        assertEquals("user_1700000000000_abc", currentUser.requireSelf("user_1700000000000_abc"));
        assertThrows(UnauthorizedException.class,
                () -> currentUser.requireRegisteredSelf("user_1700000000000_abc"));
    }
}
