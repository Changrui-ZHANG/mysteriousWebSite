package com.changrui.mysterious.shared.exception;

/**
 * Exception thrown when a request carries no valid identity token (HTTP 401).
 * Use UnauthorizedException (HTTP 403) when the identity is known but not allowed.
 */
public class UnauthenticatedException extends RuntimeException {

    public UnauthenticatedException(String message) {
        super(message);
    }
}
