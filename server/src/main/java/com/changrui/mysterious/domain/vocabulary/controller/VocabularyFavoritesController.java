package com.changrui.mysterious.domain.vocabulary.controller;

import com.changrui.mysterious.domain.vocabulary.model.VocabularyItem;
import com.changrui.mysterious.domain.vocabulary.service.VocabularyFavoriteService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * Controller for managing user vocabulary favorites.
 */
@RestController
@RequestMapping("/api/vocabulary/favorites")
public class VocabularyFavoritesController {

    @Autowired
    private VocabularyFavoriteService favoriteService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> getFavorites(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getFavoriteIds(userId)));
    }

    @PostMapping("/{userId}/{vocabId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> addFavorite(
            @PathVariable String userId,
            @PathVariable Integer vocabId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.addFavorite(userId, vocabId)));
    }

    @DeleteMapping("/{userId}/{vocabId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> removeFavorite(
            @PathVariable String userId,
            @PathVariable Integer vocabId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.removeFavorite(userId, vocabId)));
    }

    @GetMapping("/{userId}/details")
    public ResponseEntity<ApiResponse<List<VocabularyItem>>> getFavoritesDetails(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getFavoriteDetails(userId)));
    }
}
