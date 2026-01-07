package com.changrui.mysterious.domain.user.dto;

/**
 * DTO for updating user information (admin operation).
 */
public record UserUpdateDTO(
        String username,
        String password
) {}
