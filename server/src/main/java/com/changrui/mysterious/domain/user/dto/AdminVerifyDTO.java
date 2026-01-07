package com.changrui.mysterious.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for admin verification requests.
 */
public record AdminVerifyDTO(
        @NotBlank(message = "Admin code is required")
        String code
) {}
