package com.changrui.mysterious.domain.messagewall.service;

import com.changrui.mysterious.domain.messagewall.model.ChatSetting;
import com.changrui.mysterious.domain.messagewall.dto.MessageResponse;
import com.changrui.mysterious.domain.messagewall.model.Message;
import com.changrui.mysterious.domain.messagewall.model.MessageReaction;
import com.changrui.mysterious.domain.messagewall.model.MessageReaction.ReactionUser;
import com.changrui.mysterious.domain.messagewall.repository.ChatSettingRepository;
import com.changrui.mysterious.domain.messagewall.repository.MessageRepository;
import com.changrui.mysterious.domain.profile.service.ActivityService;
import com.changrui.mysterious.domain.profile.service.ProfileIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;

/**
 * Service for managing chat messages.
 */
@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatSettingRepository chatSettingRepository;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ProfileIntegrationService profileIntegrationService;

    public List<MessageResponse> getAllMessages() {
        List<Message> messages = messageRepository.findAllByOrderByTimestampAsc();
        return profileIntegrationService.enrichMessagesWithProfiles(messages);
    }

    public MessageResponse addMessage(Message message) {
        Message savedMessage = messageRepository.save(message);

        // Record activity for profile statistics and update last active
        if (savedMessage.getUserId() != null && !savedMessage.getUserId().isEmpty()) {
            try {
                activityService.recordMessageActivity(savedMessage.getUserId());
                profileIntegrationService.updateLastActiveFromMessage(savedMessage.getUserId());
            } catch (Exception e) {
                // Log error but don't fail the message save
            }
        }

        // Use ProfileIntegrationService to enrich and convert to DTO
        // We pass the saved message to get the enriched DTO
        return profileIntegrationService.enrichMessageWithProfile(
                savedMessage,
                profileIntegrationService.getProfileForMessage(savedMessage.getUserId()));
    }

    public Message getMessageById(String id) {
        return messageRepository.findById(id).orElse(null);
    }

    @Transactional
    public boolean deleteMessage(String id, String userId) {
        try {
            messageRepository.deleteByIdAndUserId(id, userId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public void deleteMessageById(String id) {
        messageRepository.deleteById(id);
    }

    public boolean isMuted() {
        return chatSettingRepository.findById(ChatSetting.MUTE_KEY)
                .map(setting -> "true".equals(setting.getSettingValue()))
                .orElse(false);
    }

    @Transactional
    public void setMuted(boolean muted) {
        ChatSetting setting = chatSettingRepository.findById(ChatSetting.MUTE_KEY)
                .orElse(new ChatSetting(ChatSetting.MUTE_KEY, "false"));
        setting.setSettingValue(String.valueOf(muted));
        chatSettingRepository.save(setting);
    }

    public void clearAllMessages() {
        messageRepository.deleteAll();
    }

    /**
     * Add a reaction to a message
     */
    @Transactional
    public MessageResponse addReaction(String messageId, String userId, String username, String emoji) {
        System.out.println("[MessageService.addReaction] Adding reaction " + emoji + " to message " + messageId);

        Message message = messageRepository.findById(messageId).orElse(null);
        if (message == null) {
            System.out.println("[MessageService.addReaction] Message not found: " + messageId);
            return null;
        }

        List<MessageReaction> reactions = message.getReactions();
        if (reactions == null) {
            reactions = new LinkedList<>();
        }

        // Find existing reaction with this emoji
        MessageReaction existingReaction = reactions.stream()
                .filter(r -> emoji.equals(r.getEmoji()))
                .findFirst()
                .orElse(null);

        if (existingReaction != null) {
            // Check if user already reacted
            boolean userAlreadyReacted = existingReaction.getUsers().stream()
                    .anyMatch(u -> userId.equals(u.getUserId()));

            if (!userAlreadyReacted) {
                // Add user to existing reaction
                existingReaction.getUsers().add(new ReactionUser(userId, username, System.currentTimeMillis()));
                existingReaction.setCount(existingReaction.getUsers().size());
                System.out.println("[MessageService.addReaction] Added user to existing reaction, new count: "
                        + existingReaction.getCount());
            } else {
                System.out.println("[MessageService.addReaction] User already reacted with this emoji");
            }
        } else {
            // Create new reaction
            List<ReactionUser> users = new LinkedList<>();
            users.add(new ReactionUser(userId, username, System.currentTimeMillis()));
            MessageReaction newReaction = new MessageReaction(emoji, 1, users);
            reactions.add(newReaction);
            System.out.println("[MessageService.addReaction] Created new reaction: " + emoji);
        }

        message.setReactions(reactions);

        Message saved = messageRepository.save(message);
        System.out.println("[MessageService.addReaction] Reactions saved. Count: " + saved.getReactions().size());

        return profileIntegrationService.enrichMessageWithProfile(
                saved,
                profileIntegrationService.getProfileForMessage(saved.getUserId()));
    }

    /**
     * Remove a reaction from a message
     */
    @Transactional
    public MessageResponse removeReaction(String messageId, String userId, String emoji) {
        Message message = messageRepository.findById(messageId).orElse(null);
        if (message == null) {
            return null;
        }

        List<MessageReaction> reactions = message.getReactions();
        if (reactions == null || reactions.isEmpty()) {
            return profileIntegrationService.enrichMessageWithProfile(
                    message,
                    profileIntegrationService.getProfileForMessage(message.getUserId()));
        }

        // Find reaction with this emoji
        MessageReaction existingReaction = reactions.stream()
                .filter(r -> emoji.equals(r.getEmoji()))
                .findFirst()
                .orElse(null);

        if (existingReaction != null) {
            // Remove user from reaction
            existingReaction.getUsers().removeIf(u -> userId.equals(u.getUserId()));
            existingReaction.setCount(existingReaction.getUsers().size());

            // Remove reaction if no users left
            if (existingReaction.getCount() == 0) {
                reactions.remove(existingReaction);
            }
        }

        message.setReactions(reactions);
        Message saved = messageRepository.save(message);

        return profileIntegrationService.enrichMessageWithProfile(
                saved,
                profileIntegrationService.getProfileForMessage(saved.getUserId()));
    }
}
