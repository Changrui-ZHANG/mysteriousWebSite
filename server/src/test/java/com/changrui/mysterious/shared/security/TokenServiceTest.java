package com.changrui.mysterious.shared.security;

import static org.junit.jupiter.api.Assertions.*;

import com.changrui.mysterious.shared.security.TokenService.Identity;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for TokenService.
 */
class TokenServiceTest {

    private final TokenService tokenService = new TokenService("test-secret", "super");

    @Test
    void validTokenRoundTrips() {
        String token = tokenService.issue("user-1", false);

        Identity identity = tokenService.verify(token).orElseThrow();
        assertEquals("user-1", identity.userId());
        assertFalse(identity.guest());
    }

    @Test
    void guestFlagIsPreserved() {
        Identity identity = tokenService.verify(tokenService.issue("user_1700000000000_abc", true)).orElseThrow();
        assertTrue(identity.guest());
    }

    @Test
    void tamperedPayloadIsRejected() {
        String token = tokenService.issue("user-1", false);
        String forgedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(
                "{\"uid\":\"admin\",\"guest\":false,\"iat\":0,\"exp\":99999999999}".getBytes(StandardCharsets.UTF_8));
        String forged = forgedPayload + token.substring(token.indexOf('.'));

        assertTrue(tokenService.verify(forged).isEmpty());
    }

    @Test
    void tamperedSignatureIsRejected() {
        String token = tokenService.issue("user-1", false);
        // Flip a character in the middle of the signature (the last one carries padding bits)
        int i = token.indexOf('.') + 5;
        char c = token.charAt(i);
        String forged = token.substring(0, i) + (c == 'A' ? 'B' : 'A') + token.substring(i + 1);

        assertTrue(tokenService.verify(forged).isEmpty());
    }

    @Test
    void tokenFromAnotherSecretIsRejected() {
        String token = new TokenService("other-secret", "super").issue("user-1", false);
        assertTrue(tokenService.verify(token).isEmpty());
    }

    @Test
    void expiredTokenIsRejected() {
        long issuedAt = 1_000_000L;
        String userToken = tokenService.issue("user-1", false, issuedAt);
        String guestToken = tokenService.issue("guest-1", true, issuedAt);

        long afterUserExpiry = issuedAt + TokenService.USER_TTL_SECONDS;
        assertTrue(tokenService.verify(userToken, afterUserExpiry - 1).isPresent());
        assertTrue(tokenService.verify(userToken, afterUserExpiry).isEmpty());
        // Guests live longer
        assertTrue(tokenService.verify(guestToken, afterUserExpiry).isPresent());
        assertTrue(tokenService.verify(guestToken, issuedAt + TokenService.GUEST_TTL_SECONDS).isEmpty());
    }

    @Test
    void garbageIsRejected() {
        assertTrue(tokenService.verify(null).isEmpty());
        assertTrue(tokenService.verify("").isEmpty());
        assertTrue(tokenService.verify("abc").isEmpty());
        assertTrue(tokenService.verify("a.b.c").isEmpty());
        assertTrue(tokenService.verify("!!!.???").isEmpty());
    }

    @Test
    void blankSecretFallsBackToStableDerivedSecret() {
        String token = new TokenService("", "super").issue("user-1", false);
        assertTrue(new TokenService(" ", "super").verify(token).isPresent());
        assertTrue(new TokenService("", "other").verify(token).isEmpty());
    }
}
