package com.changrui.mysterious.dto.user;

import jakarta.validation.constraints.Size;

/**
 * DTO for updating a user (admin only)
 */
public record UserUpdateDTO(
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters") String username,

        @Size(min = 6, message = "Password must be at least 6 characters") String password,

        String superAdminCode) {
}
