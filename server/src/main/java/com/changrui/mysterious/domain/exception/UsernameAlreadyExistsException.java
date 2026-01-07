package com.changrui.mysterious.domain.exception;

/**
 * Exception levée lorsqu'un nom d'utilisateur existe déjà.
 */
public class UsernameAlreadyExistsException extends DomainException {

    private static final String ERROR_CODE = "USERNAME_ALREADY_EXISTS";

    public UsernameAlreadyExistsException(String username) {
        super("Username '" + username + "' is already taken");
    }

    @Override
    public String getErrorCode() {
        return ERROR_CODE;
    }
}
