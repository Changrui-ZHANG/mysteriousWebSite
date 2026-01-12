package com.changrui.mysterious.domain.profile.middleware;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark controller methods that require admin access.
 * When applied, the middleware will verify that the requester has valid admin credentials.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAdmin {
    
    /**
     * Whether super admin access is required.
     * If true, only super admin can access the endpoint.
     * If false, both admin and super admin can access.
     */
    boolean superAdminOnly() default false;
}