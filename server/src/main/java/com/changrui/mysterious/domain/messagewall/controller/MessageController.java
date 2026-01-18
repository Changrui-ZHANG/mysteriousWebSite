package com.changrui.mysterious.domain.messagewall.controller;

import com.changrui.mysterious.domain.messagewall.dto.MessageResponse;
import com.changrui.mysterious.domain.messagewall.model.Message;
import com.changrui.mysterious.domain.messagewall.service.MessageService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.domain.user.service.UserVerificationService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<MessageResponse>> getAllMessages() {
        List<MessageResponse> messages = messageService.getAllMessages();

        return ResponseEntity.ok()
                .header("X-System-Muted", String.valueOf(messageService.isMuted()))
                .body(messages);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> addMessage(
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

        MessageResponse saved = messageService.addMessage(message);

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

    /**
     * Add a reaction to a message
     */
    @PostMapping("/reactions/add")
    public ResponseEntity<ApiResponse<MessageResponse>> addReaction(@RequestBody ReactionRequest request) {
        MessageResponse updated = messageService.addReaction(
                request.getMessageId(),
                request.getUserId(),
                request.getUsername(),
                request.getEmoji());

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        // Broadcast reaction update to all clients
        webSocketController.broadcastReactionUpdate(updated.getId(), updated.getReactions());

        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    /**
     * Remove a reaction from a message
     */
    @PostMapping("/reactions/remove")
    public ResponseEntity<ApiResponse<MessageResponse>> removeReaction(@RequestBody ReactionRequest request) {
        MessageResponse updated = messageService.removeReaction(
                request.getMessageId(),
                request.getUserId(),
                request.getEmoji());

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        // Broadcast reaction update to all clients
        webSocketController.broadcastReactionUpdate(updated.getId(), updated.getReactions());

        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    /**
     * DTO for reaction requests
     */
    public static class ReactionRequest {
        private String messageId;
        private String userId;
        private String username;
        private String emoji;

        public String getMessageId() {
            return messageId;
        }

        public void setMessageId(String messageId) {
            this.messageId = messageId;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmoji() {
            return emoji;
        }

        public void setEmoji(String emoji) {
            this.emoji = emoji;
        }
    }
}
