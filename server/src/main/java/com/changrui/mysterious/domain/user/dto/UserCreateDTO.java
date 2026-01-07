package com.changrui.mysterious.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for creating a new user (admin operation).
 */
public record UserCreateDTO(
        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Password is required")
        String password
) {}
