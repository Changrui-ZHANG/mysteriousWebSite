package com.changrui.mysterious.exception;

/**
 * Exception thrown when authorization fails
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException() {
        super("Unauthorized access");
    }
}
