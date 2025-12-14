package com.changrui.mysterious.dto.auth;

/**
 * DTO for authentication response
 */
public record AuthResponseDTO(
        String userId,
        String username,
        String message) {
}
