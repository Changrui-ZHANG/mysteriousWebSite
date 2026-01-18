package com.changrui.mysterious.domain.media.service;

import com.changrui.mysterious.domain.media.model.MediaUploadResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service pour gérer l'upload et la gestion des médias
 */
@Service
public class MediaService {
    
    @Value("${app.media.upload-dir:uploads/media}")
    private String uploadDir;
    
    @Value("${app.media.max-file-size:5242880}") // 5MB par défaut
    private long maxFileSize;
    
    @Value("${app.media.max-width:4096}")
    private int maxWidth;
    
    @Value("${app.media.max-height:4096}")
    private int maxHeight;
    
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        "jpg", "jpeg", "png", "gif", "webp"
    );
    
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    
    /**
     * Upload un fichier image
     */
    public MediaUploadResult uploadImage(MultipartFile file) throws IOException {
        // Validation du fichier
        validateFile(file);
        
        // Créer le répertoire d'upload s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Générer un nom de fichier unique
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
        
        // Chemin complet du fichier
        Path filePath = uploadPath.resolve(uniqueFilename);
        
        // Copier le fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Obtenir les dimensions de l'image
        Integer width = null;
        Integer height = null;
        try {
            BufferedImage image = ImageIO.read(filePath.toFile());
            if (image != null) {
                width = image.getWidth();
                height = image.getHeight();
                
                // Valider les dimensions
                if (width > maxWidth || height > maxHeight) {
                    // Supprimer le fichier uploadé
                    Files.deleteIfExists(filePath);
                    throw new IllegalArgumentException(
                        String.format("Dimensions trop importantes. Maximum: %dx%dpx, Actuel: %dx%dpx", 
                                    maxWidth, maxHeight, width, height)
                    );
                }
            }
        } catch (IOException e) {
            // Si on ne peut pas lire l'image, on continue sans les dimensions
            System.err.println("Impossible de lire les dimensions de l'image: " + e.getMessage());
        }
        
        // Construire l'URL du fichier
        String fileUrl = "/api/media/" + uniqueFilename;
        
        // Retourner le résultat
        return new MediaUploadResult(
            fileUrl,
            originalFilename,
            file.getSize(),
            file.getContentType(),
            width,
            height
        );
    }
    
    /**
     * Supprime un fichier média
     */
    public boolean deleteMedia(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Obtient un fichier média
     */
    public File getMediaFile(String filename) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        
        // Vérifier que le fichier existe et est dans le répertoire autorisé
        if (!Files.exists(filePath) || !filePath.startsWith(Paths.get(uploadDir))) {
            throw new IOException("Fichier non trouvé ou accès non autorisé");
        }
        
        return filePath.toFile();
    }
    
    /**
     * Valide un fichier uploadé
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        
        // Vérifier la taille
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                String.format("Fichier trop volumineux. Taille maximum: %d bytes, Actuel: %d bytes", 
                            maxFileSize, file.getSize())
            );
        }
        
        // Vérifier le type MIME
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                "Type de fichier non supporté. Types acceptés: " + String.join(", ", ALLOWED_MIME_TYPES)
            );
        }
        
        // Vérifier l'extension
        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Nom de fichier invalide");
        }
        
        String extension = getFileExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException(
                "Extension de fichier non supportée. Extensions acceptées: " + String.join(", ", ALLOWED_EXTENSIONS)
            );
        }
    }
    
    /**
     * Obtient l'extension d'un fichier
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "";
        }
        
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        
        return filename.substring(lastDotIndex + 1);
    }
}