package com.changrui.mysterious.domain.user.dto;

/**
 * DTO for admin session start response.
 */
public record StartAdminSessionDTO(
        String role,
        String message
) {}
