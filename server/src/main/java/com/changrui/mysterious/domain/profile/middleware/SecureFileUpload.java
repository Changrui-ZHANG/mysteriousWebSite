package com.changrui.mysterious.domain.profile.middleware;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark endpoints that handle secure file uploads.
 * Enables additional security checks and logging.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SecureFileUpload {
    
    /**
     * The type of secure operation being performed.
     */
    String operation() default "upload";
    
    /**
     * Whether to require authentication for this upload.
     */
    boolean requireAuth() default true;
    
    /**
     * Whether to enable rate limiting for this endpoint.
     */
    boolean enableRateLimit() default true;
    
    /**
     * Maximum number of files allowed in a single request.
     */
    int maxFiles() default 1;
}