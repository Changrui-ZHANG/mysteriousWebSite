package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

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
        List<Score> rawScores;
        boolean asc = "maze".equals(gameType);

        if (asc) {
            rawScores = scoreRepository.findTop50ByGameTypeOrderByScoreAsc(gameType);
        } else {
            rawScores = scoreRepository.findTop50ByGameTypeOrderByScoreDesc(gameType);
        }

        // Java-side Deduplication (One score per user)
        List<Score> topScores = new ArrayList<>();
        Set<String> seenUsers = new HashSet<>();

        for (Score s : rawScores) {
            // Safety check for null userId
            if (s.getUserId() != null && !seenUsers.contains(s.getUserId())) {
                // For Maze, filter out '0' scores if they are considered invalid/defaults
                if (asc && s.getScore() == 0)
                    continue;

                seenUsers.add(s.getUserId());
                topScores.add(s);
                if (topScores.size() >= 3)
                    break;
            }
        }

        return ResponseEntity.ok(topScores);
    }

    @GetMapping("/user/{userId}/{gameType}")
    public ResponseEntity<Score> getUserHighScore(@PathVariable String userId, @PathVariable String gameType) {
        Score score;
        if ("maze".equals(gameType)) {
            score = scoreRepository.findTopByUserIdAndGameTypeOrderByScoreAsc(userId, gameType);
        } else {
            score = scoreRepository.findTopByUserIdAndGameTypeOrderByScoreDesc(userId, gameType);
        }

        if (score == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(score);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> submitScore(@RequestBody Map<String, Object> body) {
        try {
            System.out.println("DEBUG: Entering submitScore");
            String gameType = (String) body.get("gameType");
            Integer scoreValue = (Integer) body.get("score");
            String userId = (String) body.get("userId");
            Integer attempts = body.containsKey("attempts") ? (Integer) body.get("attempts") : null;

            if (gameType == null || userId == null || scoreValue == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
            }

            System.out.println("DEBUG: Processing " + gameType + " Score: " + scoreValue + " for User: " + userId);

            String username = (String) body.get("username");

            // Look up existing scores for this user and game
            List<Score> existingScores = scoreRepository.findByUserIdAndGameType(userId, gameType);

            if (!existingScores.isEmpty()) {
                // Sort based on game type logic to find the "best" entry currently in DB
                if ("maze".equals(gameType)) {
                    // ASC for Maze (Lower is better)
                    existingScores.sort((s1, s2) -> Integer.compare(s1.getScore(), s2.getScore()));
                } else {
                    // DESC for others (Higher is better)
                    existingScores.sort((s1, s2) -> Integer.compare(s2.getScore(), s1.getScore()));
                }

                // Best entry is the first one after sort
                Score bestEntry = existingScores.get(0);
                System.out.println("DEBUG: Current Best: " + bestEntry.getScore());

                // Check if new score is an improvement or tie
                boolean isImprovement = false;
                if ("maze".equals(gameType)) {
                    // Update if new score is lower or equal (tie updates timestamp)
                    // CRITICAL FIX: Treat 0 as invalid/overwrite-able for Maze
                    if (bestEntry.getScore() == 0 || scoreValue <= bestEntry.getScore()) {
                        isImprovement = true;
                    }
                } else {
                    // Update if new score is higher or equal (tie updates timestamp)
                    if (scoreValue >= bestEntry.getScore())
                        isImprovement = true;
                }

                System.out.println("DEBUG: Is Improvement? " + isImprovement);

                // Clean up any duplicate/worse entries that shouldn't exist
                if (existingScores.size() > 1) {
                    for (int i = 1; i < existingScores.size(); i++) {
                        scoreRepository.delete(existingScores.get(i));
                    }
                }

                if (isImprovement) {
                    bestEntry.setScore(scoreValue);
                    bestEntry.setTimestamp(System.currentTimeMillis());
                    bestEntry.setAttempts(attempts);
                    if (username != null && !username.isEmpty()) {
                        bestEntry.setUsername(username);
                    }
                    scoreRepository.save(bestEntry);
                    return ResponseEntity.ok(Map.of("message", "High score updated!"));
                } else {
                    return ResponseEntity.ok(Map.of("message", "Score not better than existing best."));
                }
            } else {
                System.out.println("DEBUG: New Score Entry");
                // Create new score
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
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error submitting score: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> resetScore(@PathVariable String id, @RequestParam String adminCode) {
        if (!"ChangruiZ".equals(adminCode)) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        return scoreRepository.findById(id).map(score -> {
            scoreRepository.delete(score);
            return ResponseEntity.ok(Map.of("message", "Score deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
