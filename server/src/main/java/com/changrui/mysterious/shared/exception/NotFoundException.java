package com.changrui.mysterious.shared.exception;

/**
 * Exception thrown when a requested resource is not found.
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException(String entityName, String id) {
        super(entityName + " not found with id: " + id);
    }
}