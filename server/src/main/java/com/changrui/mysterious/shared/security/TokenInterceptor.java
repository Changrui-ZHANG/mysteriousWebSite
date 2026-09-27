package com.changrui.mysterious.shared.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Reads "Authorization: Bearer <token>" and stores the verified identity as a request attribute.
 * Missing, invalid or expired tokens leave the request anonymous; endpoints decide via CurrentUser.
 */
@Component
@RequiredArgsConstructor
public class TokenInterceptor implements HandlerInterceptor {

    private static final String BEARER = "Bearer ";

    private final TokenService tokenService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER)) {
            tokenService.verify(header.substring(BEARER.length()).trim())
                    .ifPresent(identity -> request.setAttribute(CurrentUser.ATTRIBUTE, identity));
        }
        return true;
    }
}
