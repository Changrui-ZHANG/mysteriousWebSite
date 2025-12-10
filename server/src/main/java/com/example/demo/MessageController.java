package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost"})
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping
    public List<Message> getAllMessages() {
        return messageService.getAllMessages();
    }

    @PostMapping
    public Message addMessage(@RequestBody Message message) {
        return messageService.addMessage(message);
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
