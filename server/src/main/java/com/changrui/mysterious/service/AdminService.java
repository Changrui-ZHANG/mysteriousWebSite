package com.changrui.mysterious.service;

import org.springframework.stereotype.Service;

/**
 * Centralized service for admin authentication and authorization.
 * Replaces hardcoded admin codes scattered across controllers.
 */
@Service
public class AdminService {

    @org.springframework.beans.factory.annotation.Value("${app.admin.code}")
    private String adminCode;

    @org.springframework.beans.factory.annotation.Value("${app.super-admin.code}")
    private String superAdminCode;

    /**
     * Check if the provided code is a valid admin code (either Admin or Super
     * Admin).
     * 
     * @param code The code to validate
     * @return true if valid, false otherwise
     */
    public boolean isValidAdminCode(String code) {
        return code != null && (code.equals(adminCode) || code.equals(superAdminCode));
    }

    /**
     * Check if the code is specifically the Admin code.
     * 
     * @param code The code to check
     * @return true if it's the admin code
     */
    public boolean isAdmin(String code) {
        return adminCode.equals(code);
    }

    /**
     * Check if the code is specifically the Super Admin code.
     * 
     * @param code The code to check
     * @return true if it's the super admin code
     */
    public boolean isSuperAdmin(String code) {
        return superAdminCode.equals(code);
    }

    /**
     * Get the admin level for the given code.
     * 
     * @param code The code to check
     * @return The admin level
     */
    public AdminLevel getAdminLevel(String code) {
        if (isSuperAdmin(code)) {
            return AdminLevel.SUPER_ADMIN;
        } else if (isAdmin(code)) {
            return AdminLevel.ADMIN;
        }
        return AdminLevel.NONE;
    }

    /**
     * Validate admin code and throw exception if invalid.
     * 
     * @param code The code to validate
     * @throws SecurityException if the code is invalid
     */
    public void validateAdminCode(String code) throws SecurityException {
        if (!isValidAdminCode(code)) {
            throw new SecurityException("Invalid admin code");
        }
    }

    /**
     * Validate super admin code and throw exception if invalid.
     * 
     * @param code The code to validate
     * @throws SecurityException if the code is not a super admin code
     */
    public void validateSuperAdminCode(String code) throws SecurityException {
        if (!isSuperAdmin(code)) {
            throw new SecurityException("Invalid super admin code");
        }
    }

    /**
     * Admin level enum
     */
    public enum AdminLevel {
        NONE,
        ADMIN,
        SUPER_ADMIN
    }
}
