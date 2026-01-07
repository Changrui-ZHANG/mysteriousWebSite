package com.changrui.mysterious.application.service.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service pour l'authentification et l'autorisation des administrateurs.
 * Remplace l'ancien AdminService.
 */
@Service
public class AdminAuthenticationService {

    @Value("${app.admin.code}")
    private String adminCode;

    @Value("${app.super-admin.code}")
    private String superAdminCode;

    /**
     * Niveau d'administration
     */
    public enum AdminLevel {
        NONE,
        ADMIN,
        SUPER_ADMIN
    }

    /**
     * Vérifie si le code fourni est un code admin valide (Admin ou Super Admin).
     */
    public boolean isValidAdminCode(String code) {
        return code != null && (code.equals(adminCode) || code.equals(superAdminCode));
    }

    /**
     * Vérifie si le code est spécifiquement le code Admin.
     */
    public boolean isAdmin(String code) {
        return adminCode.equals(code);
    }

    /**
     * Vérifie si le code est spécifiquement le code Super Admin.
     */
    public boolean isSuperAdmin(String code) {
        return superAdminCode.equals(code);
    }

    /**
     * Récupère le niveau d'admin pour un code donné.
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
     * Valide le code admin et lève une exception si invalide.
     */
    public void validateAdminCode(String code) {
        if (!isValidAdminCode(code)) {
            throw new SecurityException("Invalid admin code");
        }
    }
}
