package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost", "http://localhost:3001",
        "http://changrui.freeboxos.fr:3001", "http://changrui.freeboxos.fr", "http://changrui.freeboxos.fr:5173" })
@RequestMapping("/api/scores")
public class ScoreController {

    @Autowired
    private ScoreRepository scoreRepository;

    @Autowired
    private AppUserRepository userRepository;

    @GetMapping("/top/{gameType}")
    public ResponseEntity<List<Score>> getTopScores(@PathVariable String gameType) {
        return ResponseEntity.ok(scoreRepository.findTop3ByGameTypeOrderByScoreDesc(gameType));
    }

    @PostMapping
    public ResponseEntity<?> submitScore(@RequestBody Map<String, Object> body) {
        try {
            String gameType = (String) body.get("gameType");
            int scoreValue = (int) body.get("score");
            String userId = (String) body.get("userId");

            if (gameType == null || userId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
            }

            // Check if user exists to get the correct username, or look it up from the
            // previous Auth implementation details if needed.
            // For now, we trust the client to send a userId and we might want to verify it
            // or look up the username.
            // ideally we should look up the AppUser if authenticated.
            // If the user sends a 'username' we can use that, or look it up by ID.

            String username = (String) body.get("username");

            // Simple validation: If no username provided, try to find by ID if it's an
            // authenticated ID
            if (username == null || username.isEmpty()) {
                var appUser = userRepository.findById(userId);
                if (appUser.isPresent()) {
                    username = appUser.get().getUsername();
                } else {
                    username = "Anonymous";
                }
            }

            Score newScore = new Score(username, userId, gameType, scoreValue, System.currentTimeMillis());
            scoreRepository.save(newScore);

            return ResponseEntity.ok(Map.of("message", "Score submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error submitting score: " + e.getMessage()));
        }
    }
}
