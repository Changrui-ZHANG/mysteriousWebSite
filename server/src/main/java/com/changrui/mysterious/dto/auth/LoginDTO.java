package com.changrui.mysterious.dto.auth;

import jakarta.validation.constraints.*;

/**
 * DTO for user login
 */
public record LoginDTO(
        @NotBlank(message = "Username is required") String username,

        @NotBlank(message = "Password is required") String password) {
}
