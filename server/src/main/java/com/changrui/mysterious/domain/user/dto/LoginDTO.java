package com.changrui.mysterious.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for user login requests.
 */
public record LoginDTO(
        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Password is required")
        String password
) {}
