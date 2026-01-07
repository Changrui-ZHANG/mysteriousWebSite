package com.changrui.mysterious.domain.vocabulary.controller;

import com.changrui.mysterious.domain.user.model.AppUser;
import com.changrui.mysterious.domain.user.repository.AppUserRepository;
import com.changrui.mysterious.domain.vocabulary.model.VocabularyItem;
import com.changrui.mysterious.domain.vocabulary.service.VocabularyService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Controller for managing user vocabulary favorites.
 */
@RestController
@RequestMapping("/api/vocabulary/favorites")
public class VocabularyFavoritesController {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private VocabularyService vocabularyService;

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
    public ResponseEntity<ApiResponse<Set<Integer>>> addFavorite(
            @PathVariable String userId,
            @PathVariable Integer vocabId) {
        AppUser user = getUser(userId);
        user.getVocabularyFavorites().add(vocabId);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(user.getVocabularyFavorites()));
    }

    @DeleteMapping("/{userId}/{vocabId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> removeFavorite(
            @PathVariable String userId,
            @PathVariable Integer vocabId) {
        AppUser user = getUser(userId);
        user.getVocabularyFavorites().remove(vocabId);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(user.getVocabularyFavorites()));
    }

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
