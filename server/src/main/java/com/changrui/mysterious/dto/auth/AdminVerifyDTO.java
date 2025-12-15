package com.changrui.mysterious.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record AdminVerifyDTO(
        @NotBlank(message = "Admin code is required") String code) {
}
