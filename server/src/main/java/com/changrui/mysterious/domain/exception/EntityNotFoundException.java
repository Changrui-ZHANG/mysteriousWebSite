package com.changrui.mysterious.domain.exception;

public class EntityNotFoundException extends DomainException {

    private static final String ERROR_CODE = "ENTITY_NOT_FOUND";

    public EntityNotFoundException(String message) {
        super(message);
    }

    @Override
    public String getErrorCode() {
        return ERROR_CODE;
    }
}
