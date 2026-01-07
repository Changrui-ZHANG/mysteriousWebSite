package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.dto.vocabulary.VocabularyDTO;
import com.changrui.mysterious.domain.model.vocabulary.VocabularyItem;
import com.changrui.mysterious.domain.port.in.vocabulary.VocabularyUseCases;
import com.changrui.mysterious.application.dto.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vocabulary")
public class VocabularyController {

    private final VocabularyUseCases vocabularyUseCases;

    public VocabularyController(VocabularyUseCases vocabularyUseCases) {
        this.vocabularyUseCases = vocabularyUseCases;
    }

    @GetMapping("/random")
    public ResponseEntity<ApiResponse<VocabularyDTO>> getRandom() {
        VocabularyItem item = vocabularyUseCases.getRandomItem();
        return item != null ? ResponseEntity.ok(ApiResponse.success(toDTO(item))) : ResponseEntity.notFound().build();
    }

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<VocabularyDTO>> getDaily() {
        VocabularyItem item = vocabularyUseCases.getDailyItem();
        return item != null ? ResponseEntity.ok(ApiResponse.success(toDTO(item))) : ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<VocabularyDTO>>> getAll() {
        List<VocabularyDTO> dtos = vocabularyUseCases.getAllItems().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping("/reload")
    public ResponseEntity<ApiResponse<Void>> reload() {
        vocabularyUseCases.reloadData();
        return ResponseEntity.ok(ApiResponse.successMessage("Data reloaded successfully"));
    }

    // --- Favorites Endpoints ---

    @GetMapping("/favorites/{userId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> getFavorites(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(vocabularyUseCases.getFavorites(userId)));
    }

    @PostMapping("/favorites/{userId}/{vocabId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> addFavorite(
            @PathVariable String userId,
            @PathVariable Integer vocabId) {
        vocabularyUseCases.addFavorite(userId, vocabId);
        return ResponseEntity.ok(ApiResponse.success(vocabularyUseCases.getFavorites(userId)));
    }

    @DeleteMapping("/favorites/{userId}/{vocabId}")
    public ResponseEntity<ApiResponse<Set<Integer>>> removeFavorite(
            @PathVariable String userId,
            @PathVariable Integer vocabId) {
        vocabularyUseCases.removeFavorite(userId, vocabId);
        return ResponseEntity.ok(ApiResponse.success(vocabularyUseCases.getFavorites(userId)));
    }

    @GetMapping("/favorites/{userId}/details")
    public ResponseEntity<ApiResponse<List<VocabularyDTO>>> getFavoritesDetails(@PathVariable String userId) {
        List<VocabularyDTO> details = vocabularyUseCases.getFavoritesDetails(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    private VocabularyDTO toDTO(VocabularyItem item) {
        return new VocabularyDTO(
                item.getId(),
                item.getExpression(),
                item.getMeaning(),
                item.getMeaningEn(),
                item.getMeaningZh(),
                item.getExample(),
                item.getLevel());
    }
}
