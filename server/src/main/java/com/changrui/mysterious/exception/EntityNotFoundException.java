package com.changrui.mysterious.exception;

/**
 * Exception thrown when a requested entity is not found
 */
public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(String entityName, String id) {
        super(String.format("%s not found with id: %s", entityName, id));
    }
}
