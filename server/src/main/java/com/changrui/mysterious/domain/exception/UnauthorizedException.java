package com.changrui.mysterious.domain.exception;

public class UnauthorizedException extends DomainException {

    private static final String ERROR_CODE = "UNAUTHORIZED";

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException() {
        super("Unauthorized access");
    }

    @Override
    public String getErrorCode() {
        return ERROR_CODE;
    }
}
