package com.changrui.mysterious.domain.media.controller;

import com.changrui.mysterious.domain.media.model.MediaUploadResult;
import com.changrui.mysterious.domain.media.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

/**
 * Contrôleur pour la gestion des médias
 */
@RestController
@RequestMapping("/api/media")
@CrossOrigin(origins = "*")
public class MediaController {
    
    @Autowired
    private MediaService mediaService;
    
    /**
     * Upload un fichier image
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            MediaUploadResult result = mediaService.uploadImage(file);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            // Erreur de validation
            Map<String, String> error = new HashMap<>();
            error.put("error", "VALIDATION_ERROR");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IOException e) {
            // Erreur d'I/O
            Map<String, String> error = new HashMap<>();
            error.put("error", "UPLOAD_ERROR");
            error.put("message", "Erreur lors de l'upload du fichier");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            // Erreur générale
            Map<String, String> error = new HashMap<>();
            error.put("error", "INTERNAL_ERROR");
            error.put("message", "Erreur interne du serveur");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Récupère un fichier média
     */
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getMedia(@PathVariable String filename) {
        try {
            File file = mediaService.getMediaFile(filename);
            
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(file);
            
            // Déterminer le type de contenu
            String contentType = Files.probeContentType(file.toPath());
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
                    
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Supprime un fichier média
     */
    @DeleteMapping("/{filename}")
    public ResponseEntity<?> deleteMedia(@PathVariable String filename) {
        try {
            boolean deleted = mediaService.deleteMedia(filename);
            
            if (deleted) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Fichier supprimé avec succès");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "FILE_NOT_FOUND");
                error.put("message", "Fichier non trouvé");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "DELETE_ERROR");
            error.put("message", "Erreur lors de la suppression du fichier");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Endpoint de santé pour vérifier le service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "MediaService");
        return ResponseEntity.ok(response);
    }
}