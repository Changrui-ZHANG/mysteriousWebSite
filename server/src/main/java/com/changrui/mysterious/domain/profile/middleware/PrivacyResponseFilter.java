package com.changrui.mysterious.domain.profile.middleware;

import com.changrui.mysterious.domain.profile.dto.ProfileResponse;
import com.changrui.mysterious.domain.profile.model.PrivacySettings;
import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import com.changrui.mysterious.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.lang.reflect.Method;
import java.util.List;

/**
 * Response body advice that automatically filters privacy-sensitive data from
 * API responses.
 * Applies privacy rules based on the requester's permissions and profile
 * privacy settings.
 */
@ControllerAdvice(basePackages = "com.changrui.mysterious.domain.profile.controller")
public class PrivacyResponseFilter implements ResponseBodyAdvice<Object> {

    @Autowired
    private PrivacyFilterMiddleware privacyFilterMiddleware;

    @Autowired
    private UserProfileRepository profileRepository;

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Apply to all profile controller responses
        Method method = returnType.getMethod();
        return method != null && (method.isAnnotationPresent(FilterPrivateFields.class) ||
                method.getDeclaringClass().getPackage().getName().contains("profile.controller"));
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request, ServerHttpResponse response) {

        // Only process successful responses
        if (body == null) {
            return body;
        }

        // Extract privacy context from request attributes (set by interceptor)
        String requesterId = extractFromRequest(request, "requesterId");
        String adminCode = extractAdminCode(request);

        // Apply privacy filtering based on response type
        if (body instanceof ApiResponse) {
            return filterApiResponse((ApiResponse<?>) body, requesterId, adminCode);
        } else if (body instanceof ProfileResponse) {
            return filterProfileResponse((ProfileResponse) body, requesterId, adminCode);
        } else if (body instanceof List) {
            return filterListResponse((List<?>) body, requesterId, adminCode);
        }

        return body;
    }

    /**
     * Filter ApiResponse objects containing profile data.
     */
    private ApiResponse<?> filterApiResponse(ApiResponse<?> apiResponse, String requesterId, String adminCode) {
        Object data = apiResponse.data();

        if (data instanceof ProfileResponse) {
            ProfileResponse filtered = filterProfileResponse((ProfileResponse) data, requesterId, adminCode);
            return ApiResponse.success(apiResponse.message(), filtered);
        } else if (data instanceof List) {
            List<?> filtered = filterListResponse((List<?>) data, requesterId, adminCode);
            return ApiResponse.success(apiResponse.message(), filtered);
        } else if (data instanceof UserProfile) {
            UserProfile filtered = filterUserProfile((UserProfile) data, requesterId, adminCode);
            return ApiResponse.success(apiResponse.message(), filtered);
        }

        return apiResponse;
    }

    /**
     * Filter ProfileResponse objects based on privacy settings.
     */
    private ProfileResponse filterProfileResponse(ProfileResponse profileResponse, String requesterId,
            String adminCode) {
        if (profileResponse == null) {
            return null;
        }

        String profileUserId = profileResponse.userId();
        PrivacyFilterMiddleware.PrivacyLevel privacyLevel = privacyFilterMiddleware.determinePrivacyLevel(profileUserId,
                requesterId, adminCode);

        // Owner and admin get unfiltered response
        if (privacyLevel == PrivacyFilterMiddleware.PrivacyLevel.OWNER ||
                privacyLevel == PrivacyFilterMiddleware.PrivacyLevel.ADMIN) {
            return profileResponse;
        }

        // Denied users get null
        if (privacyLevel == PrivacyFilterMiddleware.PrivacyLevel.DENIED) {
            return null;
        }

        // For public access, create filtered response
        // Note: This is a simplified version. In practice, you'd need to reconstruct
        // the ProfileResponse with filtered data based on privacy settings.
        return new ProfileResponse(
                profileResponse.userId(),
                profileResponse.displayName(),
                shouldShowField("bio", profileUserId, requesterId, adminCode) ? profileResponse.bio() : null,
                profileResponse.avatarUrl(),
                profileResponse.gender(),
                profileResponse.joinDate(),
                shouldShowField("lastActive", profileUserId, requesterId, adminCode) ? profileResponse.lastActive()
                        : null,
                profileResponse.isPublic(),
                profileResponse.privacySettings(), // Privacy settings are always shown to help understand filtering
                shouldShowField("stats", profileUserId, requesterId, adminCode) ? profileResponse.activityStats()
                        : null,
                shouldShowField("achievements", profileUserId, requesterId, adminCode) ? profileResponse.achievements()
                        : null);
    }

    /**
     * Filter UserProfile objects based on privacy settings.
     */
    private UserProfile filterUserProfile(UserProfile profile, String requesterId, String adminCode) {
        if (profile == null) {
            return null;
        }

        PrivacyFilterMiddleware.PrivacyLevel privacyLevel = privacyFilterMiddleware
                .determinePrivacyLevel(profile.getUserId(), requesterId, adminCode);

        // Use middleware to filter the profile
        return privacyFilterMiddleware.filterProfile(profile, null, privacyLevel);
    }

    /**
     * Filter list responses containing profile data.
     */
    private List<?> filterListResponse(List<?> list, String requesterId, String adminCode) {
        if (list == null || list.isEmpty()) {
            return list;
        }

        // Check if list contains profile objects
        Object firstItem = list.get(0);
        if (firstItem instanceof ProfileResponse) {
            return list.stream()
                    .map(item -> filterProfileResponse((ProfileResponse) item, requesterId, adminCode))
                    .filter(item -> item != null) // Remove null (denied) items
                    .collect(java.util.stream.Collectors.toList());
        } else if (firstItem instanceof UserProfile) {
            return list.stream()
                    .map(item -> filterUserProfile((UserProfile) item, requesterId, adminCode))
                    .filter(item -> item != null) // Remove null (denied) items
                    .collect(java.util.stream.Collectors.toList());
        }

        return list;
    }

    /**
     * Check if a specific field should be shown based on privacy settings.
     */
    private boolean shouldShowField(String fieldName, String profileUserId, String requesterId, String adminCode) {
        PrivacyFilterMiddleware.PrivacyLevel privacyLevel = privacyFilterMiddleware.determinePrivacyLevel(profileUserId,
                requesterId, adminCode);

        // Owner and admin can see all fields
        if (privacyLevel == PrivacyFilterMiddleware.PrivacyLevel.OWNER ||
                privacyLevel == PrivacyFilterMiddleware.PrivacyLevel.ADMIN) {
            return true;
        }

        // For public access, we need to check privacy settings
        // This is a simplified check - in practice, you'd load the actual privacy
        // settings
        return privacyLevel == PrivacyFilterMiddleware.PrivacyLevel.PUBLIC;
    }

    /**
     * Extract admin code from request headers.
     */
    private String extractAdminCode(ServerHttpRequest request) {
        List<String> headerValues = request.getHeaders().get("X-Admin-Code");
        if (headerValues != null && !headerValues.isEmpty()) {
            return headerValues.get(0);
        }
        return null;
    }

    /**
     * Extract value from request attributes or headers.
     */
    private String extractFromRequest(ServerHttpRequest request, String key) {
        // Try to get from URI query parameters
        String value = request.getURI().getQuery();
        if (value != null && value.contains(key + "=")) {
            String[] params = value.split("&");
            for (String param : params) {
                if (param.startsWith(key + "=")) {
                    return param.substring(key.length() + 1);
                }
            }
        }

        // Try to get from headers
        List<String> headerValues = request.getHeaders()
                .get("X-" + key.substring(0, 1).toUpperCase() + key.substring(1));
        if (headerValues != null && !headerValues.isEmpty()) {
            return headerValues.get(0);
        }

        return null;
    }
}