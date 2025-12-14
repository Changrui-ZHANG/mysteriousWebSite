package com.changrui.mysterious.dto.common;

import java.time.LocalDateTime;

/**
 * Generic API response wrapper for consistent response format across all
 * endpoints.
 * 
 * @param <T> Type of data being returned
 */
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        LocalDateTime timestamp) {
    /**
     * Create a successful response with data only
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, null, data, LocalDateTime.now());
    }

    /**
     * Create a successful response with message and data
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, LocalDateTime.now());
    }

    /**
     * Create a successful response with message only (no data)
     */
    public static ApiResponse<Void> successMessage(String message) {
        return new ApiResponse<>(true, message, null, LocalDateTime.now());
    }

    /**
     * Create an error response with message
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, LocalDateTime.now());
    }

    /**
     * Create an error response with message and partial data (for debugging)
     */
    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(false, message, data, LocalDateTime.now());
    }
}
