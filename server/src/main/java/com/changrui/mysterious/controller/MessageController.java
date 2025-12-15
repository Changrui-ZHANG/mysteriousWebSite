package com.changrui.mysterious.controller;

import com.changrui.mysterious.dto.common.ApiResponse;
import com.changrui.mysterious.exception.UnauthorizedException;
import com.changrui.mysterious.model.Message;
import com.changrui.mysterious.repository.AppUserRepository;
import com.changrui.mysterious.service.MessageService;
import com.changrui.mysterious.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for chat messages
 */
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok()
                .header("X-System-Muted", String.valueOf(messageService.isMuted()))
                .body(messageService.getAllMessages());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Message>> addMessage(
            @RequestBody Message message,
            @RequestParam(required = false) String adminCode) {

        if (messageService.isMuted() && !adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Chat is muted by admin");
        }

        // Verify if the user exists in DB OR if it is an Admin message
        if (appUserRepository.existsById(message.getUserId()) || adminService.isValidAdminCode(adminCode)) {
            message.setVerified(true);
        } else {
            message.setVerified(false);
        }

        // Handle Quotes in Backend for security
        if (message.getQuotedMessageId() != null && !message.getQuotedMessageId().isEmpty()) {
            Message quoted = messageService.getMessageById(message.getQuotedMessageId());
            if (quoted != null) {
                message.setQuotedName(quoted.getName());
                message.setQuotedMessage(quoted.getMessage());
            } else {
                // Sent ID invalid, clear it
                message.setQuotedMessageId(null);
            }
        }

        Message saved = messageService.addMessage(message);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PostMapping("/toggle-mute")
    public ResponseEntity<ApiResponse<Boolean>> toggleMute(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        boolean newState = !messageService.isMuted();
        messageService.setMuted(newState);

        return ResponseEntity.ok(ApiResponse.success("Mute toggled", newState));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam(required = false) String adminCode) {

        // Admin can delete any message
        if (adminService.isValidAdminCode(adminCode)) {
            messageService.deleteMessageById(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Message deleted"));
        }

        // Regular user can only delete their own messages
        boolean deleted = messageService.deleteMessage(id, userId);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(ApiResponse.successMessage("Message deleted"));
    }

    @PostMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearAllMessages(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        messageService.clearAllMessages();
        return ResponseEntity.ok(ApiResponse.successMessage("All messages cleared"));
    }
}
