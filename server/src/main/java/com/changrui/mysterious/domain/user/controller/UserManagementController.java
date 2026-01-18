package com.changrui.mysterious.domain.user.controller;

import com.changrui.mysterious.domain.user.model.AppUser;
import com.changrui.mysterious.domain.user.repository.AppUserRepository;
import com.changrui.mysterious.domain.user.service.AdminService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for super admin user management operations.
 */
@RestController
@RequestMapping("/api/superadmin")
public class UserManagementController {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam String superAdminCode) {
        if (!adminService.isSuperAdmin(superAdminCode)) {
            return ResponseEntity.status(403).body(Map.of("message", "Invalid super admin code"));
        }

        List<Map<String, String>> users = userRepository.findAll().stream()
                .map(user -> {
                    String plain = user.getPlainPassword();
                    if (plain == null) plain = user.getPassword();
                    if (plain == null) plain = "";

                    String id = user.getId();
                    if (id == null) id = "";

                    String username = user.getUsername();
                    if (username == null) username = "";

                    return Map.of(
                            "id", id,
                            "username", username,
                            "plainPassword", plain);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body, @RequestParam String superAdminCode) {
        if (!adminService.isSuperAdmin(superAdminCode)) {
            return ResponseEntity.status(403).body(Map.of("message", "Invalid super admin code"));
        }

        String username = body.get("username");
        String password = body.get("password");

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password are required"));
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));
        }

        try {
            AppUser newUser = new AppUser(username, password, password);
            userRepository.save(newUser);

            return ResponseEntity.ok(Map.of(
                    "id", newUser.getId(),
                    "username", newUser.getUsername(),
                    "plainPassword", newUser.getPlainPassword()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error creating user: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, String> body,
            @RequestParam String superAdminCode) {
        if (!adminService.isSuperAdmin(superAdminCode)) {
            return ResponseEntity.status(403).body(Map.of("message", "Invalid super admin code"));
        }

        Optional<AppUser> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AppUser user = userOpt.get();
        if (body.containsKey("username")) {
            user.setUsername(body.get("username"));
        }
        if (body.containsKey("password")) {
            String newPass = body.get("password");
            user.setPassword(newPass);
            user.setPlainPassword(newPass);
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id, @RequestParam String superAdminCode) {
        if (!adminService.isSuperAdmin(superAdminCode)) {
            return ResponseEntity.status(403).body(Map.of("message", "Invalid super admin code"));
        }

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
