package com.changrui.mysterious.domain.profile.middleware;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark controller methods that require profile ownership.
 * When applied, the middleware will verify that the requester owns the profile
 * being accessed or modified.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireProfileOwnership {
    
    /**
     * The name of the path variable containing the user ID.
     * Default is "userId".
     */
    String userIdParam() default "userId";
    
    /**
     * Whether to allow admin override.
     * If true, admin users can bypass ownership requirements.
     */
    boolean allowAdminOverride() default false;
}