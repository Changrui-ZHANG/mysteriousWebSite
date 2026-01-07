package com.changrui.mysterious.domain.exception;

/**
 * Exception de base pour toutes les exceptions métier du domaine.
 * Les exceptions du domaine ne dépendent pas de Spring ou de HTTP.
 */
public abstract class DomainException extends RuntimeException {

    protected DomainException(String message) {
        super(message);
    }

    protected DomainException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Code d'erreur unique pour identifier le type d'erreur
     */
    public abstract String getErrorCode();
}
