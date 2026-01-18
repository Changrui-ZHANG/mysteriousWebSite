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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing chat messages.
 */
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatSettingRepository chatSettingRepository;
    private final ActivityService activityService;
    private final ProfileIntegrationService profileIntegrationService;

    // ==================== Public API ====================

    public List<MessageResponse> getAllMessages() {
        List<Message> messages = messageRepository.findAllByOrderByTimestampAsc();
        return profileIntegrationService.enrichMessagesWithProfiles(messages);
    }

    public MessageResponse addMessage(Message message) {
        Message saved = messageRepository.save(message);
        recordUserActivity(saved.getUserId());
        return toResponse(saved);
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
     * Add a reaction to a message.
     * 
     * @return Updated message as DTO, or null if message not found.
     */
    @Transactional
    public MessageResponse addReaction(String messageId, String userId, String username, String emoji) {
        Message message = messageRepository.findById(messageId).orElse(null);
        if (message == null) {
            return null;
        }

        List<MessageReaction> reactions = getOrCreateReactions(message);
        Optional<MessageReaction> existing = findReactionByEmoji(reactions, emoji);

        if (existing.isPresent()) {
            addUserToReaction(existing.get(), userId, username);
        } else {
            reactions.add(createNewReaction(emoji, userId, username));
        }

        message.setReactions(reactions);
        return toResponse(messageRepository.save(message));
    }

    /**
     * Remove a reaction from a message.
     * 
     * @return Updated message as DTO, or null if message not found.
     */
    @Transactional
    public MessageResponse removeReaction(String messageId, String userId, String emoji) {
        Message message = messageRepository.findById(messageId).orElse(null);
        if (message == null) {
            return null;
        }

        List<MessageReaction> reactions = message.getReactions();
        if (reactions == null || reactions.isEmpty()) {
            return toResponse(message);
        }

        findReactionByEmoji(reactions, emoji).ifPresent(reaction -> {
            reaction.getUsers().removeIf(u -> userId.equals(u.getUserId()));
            reaction.setCount(reaction.getUsers().size());
            if (reaction.getCount() == 0) {
                reactions.remove(reaction);
            }
        });

        message.setReactions(reactions);
        return toResponse(messageRepository.save(message));
    }

    // ==================== Private Helpers ====================

    /**
     * Convert a Message entity to a MessageResponse DTO with profile enrichment.
     */
    private MessageResponse toResponse(Message message) {
        return profileIntegrationService.enrichMessageWithProfile(
                message,
                profileIntegrationService.getProfileForMessage(message.getUserId()));
    }

    /**
     * Record user activity for profile statistics.
     */
    private void recordUserActivity(String userId) {
        if (userId == null || userId.isEmpty())
            return;
        try {
            activityService.recordMessageActivity(userId);
            profileIntegrationService.updateLastActiveFromMessage(userId);
        } catch (Exception ignored) {
            // Don't fail the message save if activity tracking fails
        }
    }

    private List<MessageReaction> getOrCreateReactions(Message message) {
        List<MessageReaction> reactions = message.getReactions();
        return reactions != null ? reactions : new LinkedList<>();
    }

    private Optional<MessageReaction> findReactionByEmoji(List<MessageReaction> reactions, String emoji) {
        return reactions.stream()
                .filter(r -> emoji.equals(r.getEmoji()))
                .findFirst();
    }

    private void addUserToReaction(MessageReaction reaction, String userId, String username) {
        boolean alreadyReacted = reaction.getUsers().stream()
                .anyMatch(u -> userId.equals(u.getUserId()));
        if (!alreadyReacted) {
            reaction.getUsers().add(new ReactionUser(userId, username, System.currentTimeMillis()));
            reaction.setCount(reaction.getUsers().size());
        }
    }

    private MessageReaction createNewReaction(String emoji, String userId, String username) {
        List<ReactionUser> users = new LinkedList<>();
        users.add(new ReactionUser(userId, username, System.currentTimeMillis()));
        return new MessageReaction(emoji, 1, users);
    }
}
