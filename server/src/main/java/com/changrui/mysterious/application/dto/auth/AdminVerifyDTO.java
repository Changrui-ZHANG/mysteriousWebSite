package com.changrui.mysterious.application.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record AdminVerifyDTO(
        @NotBlank(message = "Code is required") String code) {
}
