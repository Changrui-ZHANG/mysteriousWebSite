package com.changrui.mysterious.controller;

import com.changrui.mysterious.dto.common.ApiResponse;
import com.changrui.mysterious.exception.EntityNotFoundException;
import com.changrui.mysterious.model.AppUser;
import com.changrui.mysterious.repository.AppUserRepository; // Amended from UserRepository
import com.changrui.mysterious.service.VocabularyService;
import com.changrui.mysterious.model.VocabularyItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vocabulary/favorites")
public class VocabularyFavoritesController {

    @Autowired
    private AppUserRepository userRepository; // Amended type

    @Autowired
    private VocabularyService vocabularyService;

    // Helper to get user by ID (sent from frontend as userId, NOT auth header for
    // simplicity in this legacy app)
    // Note: In a real secure app, we'd take this from the SecurityContext
    private AppUser getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> getFavorites(@PathVariable String userId) {
        AppUser user = getUser(userId);
        return ResponseEntity.ok(ApiResponse.success(user.getVocabularyFavorites()));
    }

    @PostMapping("/{userId}/{vocabId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> addFavorite(@PathVariable String userId,
            @PathVariable Integer vocabId) {
        AppUser user = getUser(userId);
        user.getVocabularyFavorites().add(vocabId);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(user.getVocabularyFavorites()));
    }

    @DeleteMapping("/{userId}/{vocabId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> removeFavorite(@PathVariable String userId,
            @PathVariable Integer vocabId) {
        AppUser user = getUser(userId);
        user.getVocabularyFavorites().remove(vocabId);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(user.getVocabularyFavorites()));
    }

    // Get full objects for the favorites list
    @GetMapping("/{userId}/details")
    public ResponseEntity<ApiResponse<List<VocabularyItem>>> getFavoritesDetails(@PathVariable String userId) {
        AppUser user = getUser(userId);
        Set<Integer> ids = user.getVocabularyFavorites();

        List<VocabularyItem> details = vocabularyService.getAllItems().stream()
                .filter(item -> ids.contains(item.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(details));
    }
}
