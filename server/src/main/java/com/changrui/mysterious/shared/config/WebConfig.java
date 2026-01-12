package com.changrui.mysterious.shared.config;

import com.changrui.mysterious.domain.profile.middleware.FileUploadInterceptor;
import com.changrui.mysterious.domain.profile.middleware.PrivacyFilterInterceptor;
import com.changrui.mysterious.domain.profile.middleware.ProfileAuthInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration for CORS, interceptors and other web-related settings.
 */
@Configuration
@EnableScheduling
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private ProfileAuthInterceptor profileAuthInterceptor;

    @Autowired
    private FileUploadInterceptor fileUploadInterceptor;

    @Autowired
    private PrivacyFilterInterceptor privacyFilterInterceptor;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Add privacy filter interceptor first (highest priority)
        registry.addInterceptor(privacyFilterInterceptor)
                .addPathPatterns("/api/profiles/**", "/api/avatars/**")
                .order(1);
        
        // Add file upload security interceptor for all file upload endpoints
        registry.addInterceptor(fileUploadInterceptor)
                .addPathPatterns("/api/avatars/**", "/api/profiles/**/upload")
                .order(2);
        
        // Add profile authentication interceptor for all profile endpoints
        registry.addInterceptor(profileAuthInterceptor)
                .addPathPatterns("/api/profiles/**")
                .order(3);
    }
}
