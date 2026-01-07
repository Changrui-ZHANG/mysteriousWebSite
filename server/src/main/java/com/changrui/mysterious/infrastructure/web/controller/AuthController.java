package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.dto.auth.*;
import com.changrui.mysterious.application.service.auth.AdminAuthenticationService;
import com.changrui.mysterious.application.dto.common.ApiResponse;
import com.changrui.mysterious.domain.port.in.LoginUserUseCase;
import com.changrui.mysterious.domain.port.in.RegisterUserUseCase;
import com.changrui.mysterious.domain.model.user.User;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for user registration and login.
 * Part of the Infrastructure layer (Web Adapter).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUserUseCase loginUserUseCase;
    private final AdminAuthenticationService adminService;

    public AuthController(
            RegisterUserUseCase registerUserUseCase,
            LoginUserUseCase loginUserUseCase,
            AdminAuthenticationService adminService) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.adminService = adminService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterDTO dto) {
        // Map DTO to Command
        RegisterUserUseCase.RegisterUserCommand command = new RegisterUserUseCase.RegisterUserCommand(dto.username(),
                dto.password());

        // Execute Use Case
        User user = registerUserUseCase.execute(command);

        AuthResponseDTO response = new AuthResponseDTO(
                user.getId().value(),
                user.getUsername(),
                "User registered successfully");

        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/verify-admin")
    public ResponseEntity<ApiResponse<StartAdminSessionDTO>> verifyAdmin(@Valid @RequestBody AdminVerifyDTO dto) {

        try {
            adminService.validateAdminCode(dto.code());
        } catch (SecurityException e) {
            // Dans une vraie architecture, on mapperait SecurityException vers une
            // exception HTTP
            throw e;
        }

        AdminAuthenticationService.AdminLevel level = adminService.getAdminLevel(dto.code());
        String role = level == AdminAuthenticationService.AdminLevel.SUPER_ADMIN ? "super_admin" : "admin";

        StartAdminSessionDTO response = new StartAdminSessionDTO(
                role,
                "Admin session started");

        return ResponseEntity.ok(ApiResponse.success("Admin verification successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginDTO dto) {
        // Map DTO to Command
        LoginUserUseCase.LoginUserCommand command = new LoginUserUseCase.LoginUserCommand(dto.username(),
                dto.password());

        // Execute Use Case
        User user = loginUserUseCase.execute(command);

        AuthResponseDTO response = new AuthResponseDTO(
                user.getId().value(),
                user.getUsername(),
                "Login successful");

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
