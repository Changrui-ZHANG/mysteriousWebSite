package com.changrui.mysterious.domain.user.dto;

/**
 * DTO for authentication response.
 */
public record AuthResponseDTO(
        String userId,
        String username,
        String message
) {}
