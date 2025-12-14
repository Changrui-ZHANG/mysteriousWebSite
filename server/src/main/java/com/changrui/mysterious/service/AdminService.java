package com.changrui.mysterious.service;

import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Centralized service for admin authentication and authorization.
 * Replaces hardcoded admin codes scattered across controllers.
 */
@Service
public class AdminService {

    private static final String ADMIN_CODE = "Changrui";
    private static final String SUPER_ADMIN_CODE = "ChangruiZ";
    private static final Set<String> VALID_ADMIN_CODES = Set.of(ADMIN_CODE, SUPER_ADMIN_CODE);

    /**
     * Check if the provided code is a valid admin code (either Admin or Super
     * Admin).
     * 
     * @param code The code to validate
     * @return true if valid, false otherwise
     */
    public boolean isValidAdminCode(String code) {
        return code != null && VALID_ADMIN_CODES.contains(code);
    }

    /**
     * Check if the code is specifically the Admin code.
     * 
     * @param code The code to check
     * @return true if it's the admin code
     */
    public boolean isAdmin(String code) {
        return ADMIN_CODE.equals(code);
    }

    /**
     * Check if the code is specifically the Super Admin code.
     * 
     * @param code The code to check
     * @return true if it's the super admin code
     */
    public boolean isSuperAdmin(String code) {
        return SUPER_ADMIN_CODE.equals(code);
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
