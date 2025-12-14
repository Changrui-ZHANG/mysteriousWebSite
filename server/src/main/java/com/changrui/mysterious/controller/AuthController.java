package com.changrui.mysterious.controller;

import com.changrui.mysterious.dto.auth.*;
import com.changrui.mysterious.dto.common.ApiResponse;
import com.changrui.mysterious.exception.ValidationException;
import com.changrui.mysterious.model.AppUser;
import com.changrui.mysterious.repository.AppUserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for user registration and login
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AppUserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterDTO dto) {
        // Check if username already exists
        if (userRepository.findByUsername(dto.username()).isPresent()) {
            throw new ValidationException("Username already taken");
        }

        // Create and save new user
        AppUser newUser = new AppUser(dto.username(), dto.password(), dto.password());
        userRepository.save(newUser);

        AuthResponseDTO response = new AuthResponseDTO(
                newUser.getId(),
                newUser.getUsername(),
                "User registered successfully");

        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
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
