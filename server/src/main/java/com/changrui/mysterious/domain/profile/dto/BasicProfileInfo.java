package com.changrui.mysterious.domain.profile.dto;

/**
 * DTO for basic profile information used in message display.
 */
public record BasicProfileInfo(
    String displayName,
    String avatarUrl
) {}