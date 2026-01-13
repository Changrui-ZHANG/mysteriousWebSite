package com.changrui.mysterious.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for user registration requests.
 */
public record RegisterDTO(
                @NotBlank(message = "Username is required") @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username,

                @NotBlank(message = "Password is required") @Size(min = 4, message = "Password must be at least 4 characters") String password,

                String gender) {
}
