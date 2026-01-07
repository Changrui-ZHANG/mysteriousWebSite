package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.dto.message.CreateMessageDTO;
import com.changrui.mysterious.application.dto.message.MessageDTO;
import com.changrui.mysterious.application.dto.common.ApiResponse;
import com.changrui.mysterious.domain.model.message.Message;
import com.changrui.mysterious.domain.port.in.message.MessageUseCases;
import com.changrui.mysterious.domain.model.user.UserId;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final com.changrui.mysterious.application.service.auth.AdminAuthenticationService adminService;
    private final MessageUseCases messageUseCases;

    public MessageController(MessageUseCases messageUseCases,
            com.changrui.mysterious.application.service.auth.AdminAuthenticationService adminService) {
        this.messageUseCases = messageUseCases;
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getAllMessages() {
        List<Message> messages = messageUseCases.getRecentMessages();
        List<MessageDTO> dtos = messages.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok()
                .header("X-System-Muted", String.valueOf(messageUseCases.isMuted()))
                .body(ApiResponse.success(dtos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MessageDTO>> addMessage(
            @RequestBody CreateMessageDTO dto,
            @RequestParam(required = false) String adminCode) {

        if (messageUseCases.isMuted() && !adminService.isValidAdminCode(adminCode)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Chat is muted"));
        }

        UserId authorId = dto.authorId() != null ? UserId.of(dto.authorId()) : null;

        MessageUseCases.SendMessageCommand command = new MessageUseCases.SendMessageCommand(
                dto.content(),
                dto.authorName(),
                authorId,
                dto.quotedMessageId(),
                null,
                null);

        Message saved = messageUseCases.sendMessage(command);
        return ResponseEntity.ok(ApiResponse.success(toDTO(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String adminCode) {

        boolean isAdmin = adminService.isValidAdminCode(adminCode);
        messageUseCases.deleteMessage(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.successMessage("Message deleted"));
    }

    @PostMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearMessages(@RequestParam String adminCode) {
        adminService.validateAdminCode(adminCode);
        messageUseCases.deleteAllMessages();
        return ResponseEntity.ok(ApiResponse.successMessage("All messages cleared"));
    }

    @PostMapping("/toggle-mute")
    public ResponseEntity<ApiResponse<Boolean>> toggleMute(@RequestParam String adminCode) {
        adminService.validateAdminCode(adminCode);
        boolean muted = messageUseCases.toggleMute();
        return ResponseEntity.ok(ApiResponse.success(muted));
    }

    @GetMapping("/is-muted")
    public ResponseEntity<ApiResponse<Boolean>> isMuted() {
        return ResponseEntity.ok(ApiResponse.success(messageUseCases.isMuted()));
    }

    private MessageDTO toDTO(Message message) {
        long timestamp = message.getCreatedAt()
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();

        return new MessageDTO(
                message.getId().toString(),
                message.getAuthorId() != null ? message.getAuthorId().value() : null,
                message.getAuthorName(),
                message.getContent(),
                timestamp,
                message.getAuthorId() == null,
                false, // isVerified TODO
                message.getQuotedMessageId(),
                message.getQuotedAuthorName(),
                message.getQuotedContent());
    }
}
