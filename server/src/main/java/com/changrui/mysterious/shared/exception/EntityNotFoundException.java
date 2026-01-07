package com.changrui.mysterious.shared.exception;

/**
 * Exception thrown when a requested entity is not found in the database.
 */
public class EntityNotFoundException extends RuntimeException {

    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(String entityName, String id) {
        super(entityName + " not found with id: " + id);
    }
}
