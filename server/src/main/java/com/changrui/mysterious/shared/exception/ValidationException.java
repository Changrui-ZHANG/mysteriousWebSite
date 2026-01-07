package com.changrui.mysterious.shared.exception;

/**
 * Exception thrown when validation fails for user input.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}
