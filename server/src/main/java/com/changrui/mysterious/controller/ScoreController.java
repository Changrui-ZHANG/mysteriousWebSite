package com.changrui.mysterious.controller;

import com.changrui.mysterious.model.Score;

import com.changrui.mysterious.repository.ScoreRepository;
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

                // Best existing score
                Score bestScore = existingScores.get(0);

                if ("maze".equals(gameType)) {
                    // Lower is better. New score must be LOWER than bestScore.
                    // Also filter out if bestScore is 0 (invalid default?) but usually 0 is best.
                    // Assuming valid moves > 0.
                    if (scoreValue >= bestScore.getScore() && bestScore.getScore() != 0) {
                        System.out
                                .println("DEBUG: Score " + scoreValue + " is not better than " + bestScore.getScore());
                        return ResponseEntity.ok(Map.of("message", "Score not high enough", "newLink", false));
                        // Originally we might return logic to client, but here we just return OK.
                    }
                } else {
                    // Higher is better.
                    if (scoreValue <= bestScore.getScore()) {
                        System.out
                                .println("DEBUG: Score " + scoreValue + " is not better than " + bestScore.getScore());
                        return ResponseEntity.ok(Map.of("message", "Score not high enough", "newLink", false));
                    }
                }

                // If better, we update the EXISTING record or add new one?
                // Logic seems to imply we keep history? But deduplication suggests we only care
                // about top.
                // Re-reading logic: "submitScore" saves a NEW entry usually.
                // But typically we might want to just save.
            }

            // Create and save new score
            Score newScore = new Score(username, userId, gameType, scoreValue, System.currentTimeMillis(), attempts);
            scoreRepository.save(newScore);
            System.out.println("DEBUG: Score Saved Successfully");

            return ResponseEntity.ok(Map.of("message", "Score submitted successfully", "newHighScore", true));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error submitting score: " + e.getMessage()));
        }
    }
}
