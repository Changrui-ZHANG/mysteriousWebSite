package com.changrui.mysterious.controller;

import com.changrui.mysterious.service.VocabularyService;
import com.changrui.mysterious.model.VocabularyItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vocabulary")
public class VocabularyController {

    @Autowired
    private VocabularyService vocabularyService;

    @GetMapping("/random")
    public ResponseEntity<VocabularyItem> getRandom() {
        VocabularyItem item = vocabularyService.getRandomItem();
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(item);
    }

    @GetMapping("/daily")
    public ResponseEntity<VocabularyItem> getDaily() {
        VocabularyItem item = vocabularyService.getDailyItem();
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(item);
    }

    @GetMapping("/all")
    public ResponseEntity<List<VocabularyItem>> getAll() {
        return ResponseEntity.ok(vocabularyService.getAllItems());
    }

    @PostMapping("/reload")
    public ResponseEntity<Map<String, String>> reload() {
        vocabularyService.loadData();
        return ResponseEntity.ok(Map.of("message", "Data reloaded successfully", "count",
                String.valueOf(vocabularyService.getAllItems().size())));
    }
}
