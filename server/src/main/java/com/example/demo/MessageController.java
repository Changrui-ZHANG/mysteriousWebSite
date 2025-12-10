package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost" })
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private AppUserRepository appUserRepository;

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok()
                .header("X-System-Muted", String.valueOf(messageService.isMuted()))
                .body(messageService.getAllMessages());
    }

    @PostMapping
    public ResponseEntity<?> addMessage(@RequestBody Message message) {
        if (messageService.isMuted() && !message.getName().equals("Admin")) { // Simple check, ideally check admin
                                                                              // status securely
            return ResponseEntity.status(403).body("Chat is muted by admin");
        }

        // Verify if the user exists in the database
        if (appUserRepository.existsById(message.getUserId())) {
            message.setVerified(true);
        } else {
            message.setVerified(false);
        }
        return ResponseEntity.ok(messageService.addMessage(message));
    }

    @PostMapping("/toggle-mute")
    public ResponseEntity<?> toggleMute(@RequestParam String adminCode) {
        if ("Changrui".equals(adminCode)) {
            boolean newState = !messageService.isMuted();
            messageService.setMuted(newState);
            return ResponseEntity.ok(Map.of("message", "Mute verified: " + newState, "isMuted", newState));
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid admin code"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam(required = false) String adminCode) {

        // Check if admin code is provided and valid
        if (adminCode != null && "Changrui".equals(adminCode)) {
            // Admin can delete any message
            messageService.deleteMessageById(id);
            return ResponseEntity.ok().build();
        }

        // Regular user can only delete their own messages
        boolean deleted = messageService.deleteMessage(id, userId);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/clear")
    public ResponseEntity<?> clearAllMessages(@RequestParam String adminCode) {
        // Simple admin verification (you can improve this)
        if ("Changrui".equals(adminCode)) {
            messageService.clearAllMessages();
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(403).body("Invalid admin code");
    }
}
