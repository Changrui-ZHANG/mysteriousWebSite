package com.changrui.mysterious.application.dto.system;

import jakarta.validation.constraints.NotNull;

public record UpdateSettingDTO(
        @NotNull String value,
        @NotNull String adminCode) {
}
