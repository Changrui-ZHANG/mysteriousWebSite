package com.changrui.mysterious.domain.profile.middleware;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark endpoints that should automatically filter private fields in responses.
 * Used to ensure privacy-sensitive data is not exposed to unauthorized users.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FilterPrivateFields {
    
    /**
     * The fields that should be filtered based on privacy settings.
     * Empty array means filter all privacy-sensitive fields.
     */
    String[] fields() default {};
    
    /**
     * Whether to apply filtering to nested objects in the response.
     */
    boolean includeNested() default true;
    
    /**
     * Whether to log field access for audit purposes.
     */
    boolean enableAuditLog() default true;
}