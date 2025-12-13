package com.changrui.mysterious.controller;

import com.changrui.mysterious.model.GameStatus;
import com.changrui.mysterious.repository.GameStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost", "http://localhost:3001",
        "http://changrui.freeboxos.fr:3001", "http://changrui.freeboxos.fr", "http://changrui.freeboxos.fr:5173" })
@RequestMapping("/api/games")
public class GameStatusController {

    @Autowired
    private GameStatusRepository gameStatusRepository;

    @GetMapping
    public ResponseEntity<List<GameStatus>> getAllStatuses() {
        return ResponseEntity.ok(gameStatusRepository.findAll());
    }

    @PostMapping("/{gameType}/toggle")
    public ResponseEntity<?> toggleGame(@PathVariable String gameType, @RequestParam String adminCode) {
        // Accept both Super Admin (ChangruiZ) and Admin (Changrui) codes for toggling
        // games
        if (!"ChangruiZ".equals(adminCode) && !"Changrui".equals(adminCode)) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        Optional<GameStatus> statusOpt = gameStatusRepository.findById(gameType);
        GameStatus status;
        if (statusOpt.isPresent()) {
            status = statusOpt.get();
            status.setEnabled(!status.isEnabled());
        } else {
            status = new GameStatus(gameType, false); // Default to disabled if toggled first time? Or inverted?
            // If it doesn't exist, it means it was implicitely enabled. So toggling makes
            // it disabled?
            // Let's assume default is ENABLED. So if not found -> create as DISABLED.
            // Wait, if not found, it implies enabled. So toggling = create entry with
            // enabled=false.
            status = new GameStatus(gameType, false);
        }
        gameStatusRepository.save(status);
        return ResponseEntity.ok(status);
    }
}
