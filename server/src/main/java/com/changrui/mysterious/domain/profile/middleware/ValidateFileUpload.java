package com.changrui.mysterious.domain.profile.middleware;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods that require file upload validation.
 * Used in conjunction with FileUploadInterceptor for automatic validation.
 */
@Target({ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateFileUpload {
    
    /**
     * The expected file type (e.g., "avatar", "image", "document").
     */
    String fileType() default "image";
    
    /**
     * Maximum file size in bytes. -1 means use default from configuration.
     */
    long maxSize() default -1;
    
    /**
     * Whether the file is required (non-empty).
     */
    boolean required() default true;
    
    /**
     * Allowed file extensions (comma-separated).
     * Empty string means use default from configuration.
     */
    String allowedExtensions() default "";
    
    /**
     * Whether to perform malware scanning on this file.
     */
    boolean enableMalwareScan() default true;
}