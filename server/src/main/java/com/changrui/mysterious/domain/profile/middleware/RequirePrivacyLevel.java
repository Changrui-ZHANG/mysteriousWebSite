package com.changrui.mysterious.domain.profile.middleware;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to specify required privacy level for accessing an endpoint.
 * Used in conjunction with PrivacyFilterInterceptor for automatic privacy enforcement.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePrivacyLevel {
    
    /**
     * The minimum privacy level required to access this endpoint.
     */
    PrivacyFilterMiddleware.PrivacyLevel value() default PrivacyFilterMiddleware.PrivacyLevel.PUBLIC;
    
    /**
     * Whether to allow admin override for this endpoint.
     */
    boolean allowAdminOverride() default true;
    
    /**
     * Custom error message when access is denied.
     */
    String message() default "Insufficient privacy permissions";
}