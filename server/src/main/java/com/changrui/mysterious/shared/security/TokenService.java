package com.changrui.mysterious.shared.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Issues and verifies signed identity tokens.
 * Format: base64url(payloadJson) + "." + base64url(HMAC-SHA256(secret, payloadJson))
 * Payload: {"uid": "...", "guest": bool, "iat": epochSec, "exp": epochSec}
 */
@Slf4j
@Service
public class TokenService {

    static final long USER_TTL_SECONDS = Duration.ofDays(30).toSeconds();
    static final long GUEST_TTL_SECONDS = Duration.ofDays(365).toSeconds();

    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64D = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecretKeySpec key;

    public TokenService(
            @Value("${app.token.secret:}") String configuredSecret,
            @Value("${app.super-admin.code}") String superAdminCode) {
        byte[] secret;
        if (configuredSecret == null || configuredSecret.isBlank()) {
            // Stable across restarts so users are not logged out on each deploy
            log.warn("APP_TOKEN_SECRET is not set: deriving the token secret from the super admin code. "
                    + "Set APP_TOKEN_SECRET to a long random value in production.");
            secret = sha256("mysterious-token:" + superAdminCode);
        } else {
            secret = configuredSecret.getBytes(StandardCharsets.UTF_8);
        }
        this.key = new SecretKeySpec(secret, "HmacSHA256");
    }

    /**
     * Verified identity carried by a token.
     */
    public record Identity(String userId, boolean guest) {
    }

    public String issue(String userId, boolean guest) {
        return issue(userId, guest, System.currentTimeMillis() / 1000);
    }

    String issue(String userId, boolean guest, long nowSeconds) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("uid", userId);
        payload.put("guest", guest);
        payload.put("iat", nowSeconds);
        payload.put("exp", nowSeconds + (guest ? GUEST_TTL_SECONDS : USER_TTL_SECONDS));
        try {
            byte[] json = objectMapper.writeValueAsBytes(payload);
            return B64.encodeToString(json) + "." + B64.encodeToString(sign(json));
        } catch (Exception e) {
            throw new IllegalStateException("Could not issue token", e);
        }
    }

    public Optional<Identity> verify(String token) {
        return verify(token, System.currentTimeMillis() / 1000);
    }

    Optional<Identity> verify(String token, long nowSeconds) {
        if (token == null) {
            return Optional.empty();
        }
        int dot = token.indexOf('.');
        if (dot <= 0 || dot != token.lastIndexOf('.')) {
            return Optional.empty();
        }
        try {
            byte[] json = B64D.decode(token.substring(0, dot));
            byte[] signature = B64D.decode(token.substring(dot + 1));
            // Constant-time comparison
            if (!MessageDigest.isEqual(sign(json), signature)) {
                return Optional.empty();
            }
            JsonNode payload = objectMapper.readTree(json);
            String uid = payload.path("uid").asText("");
            if (uid.isBlank() || payload.path("exp").asLong(0) <= nowSeconds) {
                return Optional.empty();
            }
            return Optional.of(new Identity(uid, payload.path("guest").asBoolean(false)));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private byte[] sign(byte[] data) throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(key);
        return mac.doFinal(data);
    }

    private static byte[] sha256(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }
}
