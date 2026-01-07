package com.changrui.mysterious.domain.user.controller;

import com.changrui.mysterious.domain.user.dto.*;
import com.changrui.mysterious.domain.user.model.AppUser;
import com.changrui.mysterious.domain.user.repository.AppUserRepository;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.ValidationException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for user registration and login.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterDTO dto) {
        if (userRepository.findByUsername(dto.username()).isPresent()) {
            throw new ValidationException("Username already taken");
        }

        AppUser newUser = new AppUser(dto.username(), dto.password(), dto.password());
        userRepository.save(newUser);

        AuthResponseDTO response = new AuthResponseDTO(
                newUser.getId(),
                newUser.getUsername(),
                "User registered successfully");

        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/verify-admin")
    public ResponseEntity<ApiResponse<StartAdminSessionDTO>> verifyAdmin(@Valid @RequestBody AdminVerifyDTO dto) {
        try {
            adminService.validateAdminCode(dto.code());
        } catch (SecurityException e) {
            throw new ValidationException("Invalid admin code");
        }

        AdminService.AdminLevel level = adminService.getAdminLevel(dto.code());
        String role = level == AdminService.AdminLevel.SUPER_ADMIN ? "super_admin" : "admin";

        StartAdminSessionDTO response = new StartAdminSessionDTO(role, "Admin session started");

        return ResponseEntity.ok(ApiResponse.success("Admin verification successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginDTO dto) {
        AppUser user = userRepository.findByUsername(dto.username())
                .orElseThrow(() -> new ValidationException("Invalid credentials"));

        if (!user.getPassword().equals(dto.password())) {
            throw new ValidationException("Invalid credentials");
        }

        AuthResponseDTO response = new AuthResponseDTO(
                user.getId(),
                user.getUsername(),
                "Login successful");

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
