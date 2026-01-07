package com.changrui.mysterious.domain.exception;

/**
 * Exception levée lorsque les identifiants de connexion sont invalides.
 */
public class InvalidCredentialsException extends DomainException {

    private static final String ERROR_CODE = "INVALID_CREDENTIALS";

    public InvalidCredentialsException() {
        super("Invalid username or password");
    }

    @Override
    public String getErrorCode() {
        return ERROR_CODE;
    }
}
