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
import lombok.extern.slf4j.Slf4j;

/**
 * Authentication controller for user registration and login.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private AdminService adminService;

    @Autowired
    private com.changrui.mysterious.domain.profile.service.ProfileService profileService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterDTO dto) {
        if (userRepository.findByUsername(dto.username()).isPresent()) {
            throw new ValidationException("Username already taken");
        }

        AppUser newUser = new AppUser(dto.username(), dto.password(), dto.password());
        userRepository.save(newUser);

        String avatarUrl = null;
        try {
            com.changrui.mysterious.domain.profile.dto.CreateProfileRequest profileRequest = new com.changrui.mysterious.domain.profile.dto.CreateProfileRequest(
                    newUser.getId(),
                    dto.username(),
                    null, // bio
                    true, // isPublic
                    dto.gender());
            com.changrui.mysterious.domain.profile.dto.ProfileResponse pr = profileService
                    .createProfile(profileRequest);
            avatarUrl = pr.avatarUrl();
        } catch (Exception e) {
            // Log error but don't fail registration
            log.warn("Failed to create profile for user {}: {}", newUser.getId(), e.getMessage());
        }

        AuthResponseDTO response = new AuthResponseDTO(
                newUser.getId(),
                newUser.getUsername(),
                avatarUrl,
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

        String avatarUrl = null;
        try {
            com.changrui.mysterious.domain.profile.dto.ProfileResponse pr = profileService.getProfile(user.getId(),
                    user.getId());
            avatarUrl = pr.avatarUrl();
        } catch (Exception e) {
            // Silently fail if profile not found
        }

        AuthResponseDTO response = new AuthResponseDTO(
                user.getId(),
                user.getUsername(),
                avatarUrl,
                "Login successful");

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
