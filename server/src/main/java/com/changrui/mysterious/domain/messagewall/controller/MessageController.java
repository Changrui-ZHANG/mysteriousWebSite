package com.changrui.mysterious.domain.messagewall.controller;

import com.changrui.mysterious.domain.messagewall.model.Message;
import com.changrui.mysterious.domain.messagewall.service.MessageService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.domain.user.service.UserVerificationService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for chat messages.
 * REST endpoints for initial load and admin actions.
 * Real-time updates are handled via WebSocket.
 */
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserVerificationService userVerificationService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private MessageWebSocketController webSocketController;

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

        if (userVerificationService.userExists(message.getUserId()) || adminService.isValidAdminCode(adminCode)) {
            message.setVerified(true);
        } else {
            message.setVerified(false);
        }

        if (message.getQuotedMessageId() != null && !message.getQuotedMessageId().isEmpty()) {
            Message quoted = messageService.getMessageById(message.getQuotedMessageId());
            if (quoted != null) {
                message.setQuotedName(quoted.getName());
                message.setQuotedMessage(quoted.getMessage());
            } else {
                message.setQuotedMessageId(null);
            }
        }

        Message saved = messageService.addMessage(message);
        
        // Broadcast to WebSocket subscribers
        webSocketController.broadcastNewMessage(saved);
        
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PostMapping("/toggle-mute")
    public ResponseEntity<ApiResponse<Boolean>> toggleMute(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        boolean newState = !messageService.isMuted();
        messageService.setMuted(newState);
        
        // Broadcast mute status to all clients
        webSocketController.broadcastMuteStatus(newState);

        return ResponseEntity.ok(ApiResponse.success("Mute toggled", newState));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam(required = false) String adminCode) {

        if (adminService.isValidAdminCode(adminCode)) {
            messageService.deleteMessageById(id);
            webSocketController.broadcastDelete(id);
            return ResponseEntity.ok(ApiResponse.successMessage("Message deleted"));
        }

        boolean deleted = messageService.deleteMessage(id, userId);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        
        // Broadcast deletion to all clients
        webSocketController.broadcastDelete(id);

        return ResponseEntity.ok(ApiResponse.successMessage("Message deleted"));
    }

    @PostMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearAllMessages(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        messageService.clearAllMessages();
        
        // Broadcast clear to all clients
        webSocketController.broadcastClearAll();
        
        return ResponseEntity.ok(ApiResponse.successMessage("All messages cleared"));
    }
}
