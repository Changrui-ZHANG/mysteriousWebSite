package com.changrui.mysterious.dto.auth;

import jakarta.validation.constraints.*;

/**
 * DTO for user registration
 */
public record RegisterDTO(
        @NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username,

        @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password) {
}
