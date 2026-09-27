package com.changrui.mysterious.domain.vocabulary.controller;

import com.changrui.mysterious.domain.vocabulary.model.VocabularyItem;
import com.changrui.mysterious.domain.vocabulary.service.VocabularyFavoriteService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.security.CurrentUser;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing user vocabulary favorites.
 */
@RestController
@RequestMapping("/api/vocabulary/favorites")
public class VocabularyFavoritesController {

    @Autowired
    private VocabularyFavoriteService favoriteService;

    @Autowired
    private CurrentUser currentUser;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> getFavorites(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getFavoriteIds(currentUser.requireRegisteredSelf(userId))));
    }

    @PostMapping("/{userId}/{vocabId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> addFavorite(
            @PathVariable String userId,
            @PathVariable Integer vocabId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.addFavorite(currentUser.requireRegisteredSelf(userId), vocabId)));
    }

    @DeleteMapping("/{userId}/{vocabId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> removeFavorite(
            @PathVariable String userId,
            @PathVariable Integer vocabId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.removeFavorite(currentUser.requireRegisteredSelf(userId), vocabId)));
    }

    @GetMapping("/{userId}/details")
    public ResponseEntity<ApiResponse<List<VocabularyItem>>> getFavoritesDetails(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getFavoriteDetails(currentUser.requireRegisteredSelf(userId))));
    }
}
