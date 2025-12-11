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

    @GetMapping("/user/{userId}/{gameType}")
    public ResponseEntity<Score> getUserHighScore(@PathVariable String userId, @PathVariable String gameType) {
        Score score = scoreRepository.findTopByUserIdAndGameTypeOrderByScoreDesc(userId, gameType);
        if (score == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(score);
    }

    @PostMapping
    public ResponseEntity<?> submitScore(@RequestBody Map<String, Object> body) {
        try {
            String gameType = (String) body.get("gameType");
            Integer scoreValue = (Integer) body.get("score"); // Safe cast if JSON number is int
            String userId = (String) body.get("userId");
            Integer attempts = body.containsKey("attempts") ? (Integer) body.get("attempts") : null;

            if (gameType == null || userId == null || scoreValue == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
            }

            String username = (String) body.get("username");

            // Look up existing scores for this user and game
            List<Score> existingScores = scoreRepository.findByUserIdAndGameType(userId, gameType);

            if (!existingScores.isEmpty()) {
                // Sort so that the highest score is at index 0
                existingScores.sort((s1, s2) -> Integer.compare(s2.getScore(), s1.getScore()));

                // Determine the best score entry to keep
                Score bestEntry = existingScores.get(0);

                // Optional: Cleanup duplicates if any
                if (existingScores.size() > 1) {
                    for (int i = 1; i < existingScores.size(); i++) {
                        scoreRepository.delete(existingScores.get(i));
                    }
                }

                // If new score is higher, update it
                if (scoreValue > bestEntry.getScore()) {
                    bestEntry.setScore(scoreValue);
                    bestEntry.setTimestamp(System.currentTimeMillis());
                    bestEntry.setAttempts(attempts); // Update attempts
                    if (username != null && !username.isEmpty()) {
                        bestEntry.setUsername(username);
                    }
                    scoreRepository.save(bestEntry);
                    return ResponseEntity.ok(Map.of("message", "High score updated!"));
                } else {
                    return ResponseEntity.ok(Map.of("message", "Score not higher than existing best."));
                }
            } else {
                // No existing score, create new
                if (username == null || username.isEmpty()) {
                    var appUser = userRepository.findById(userId);
                    if (appUser.isPresent()) {
                        username = appUser.get().getUsername();
                    } else {
                        username = "Anonymous";
                    }
                }

                Score newScore = new Score(username, userId, gameType, scoreValue, System.currentTimeMillis(),
                        attempts);
                scoreRepository.save(newScore);
                return ResponseEntity.ok(Map.of("message", "Score submitted successfully"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error submitting score: " + e.getMessage()));
        }
    }
}
