package com.changrui.mysterious.domain.profile.service;

import com.changrui.mysterious.domain.messagewall.model.Message;
import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for integrating profile information with other domain features.
 */
@Service
public class ProfileIntegrationService {

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private ProfileService profileService;

    /**
     * Enrich messages with profile information (avatar URLs)
     */
    public List<Message> enrichMessagesWithProfiles(List<Message> messages) {
        if (messages == null || messages.isEmpty()) {
            return messages;
        }

        // Get unique user IDs from messages
        List<String> userIds = messages.stream()
            .map(Message::getUserId)
            .filter(userId -> userId != null && !userId.isEmpty())
            .distinct()
            .collect(Collectors.toList());

        if (userIds.isEmpty()) {
            return messages;
        }

        // Fetch profiles for these users
        Map<String, UserProfile> profileMap = profileRepository.findAllById(userIds)
            .stream()
            .collect(Collectors.toMap(UserProfile::getUserId, profile -> profile));

        // Enrich messages with profile data
        return messages.stream()
            .map(message -> enrichMessageWithProfile(message, profileMap.get(message.getUserId())))
            .collect(Collectors.toList());
    }

    /**
     * Enrich a single message with profile information
     */
    public Message enrichMessageWithProfile(Message message, UserProfile profile) {
        if (message == null) {
            return message;
        }

        // Create a copy to avoid modifying the original
        Message enrichedMessage = new Message(
            message.getId(),
            message.getUserId(),
            message.getName(),
            message.getMessage(),
            message.getTimestamp(),
            message.isAnonymous(),
            message.isVerified()
        );

        // Copy quoted message info
        enrichedMessage.setQuotedMessageId(message.getQuotedMessageId());
        enrichedMessage.setQuotedName(message.getQuotedName());
        enrichedMessage.setQuotedMessage(message.getQuotedMessage());

        // Add profile information if available and profile is public
        if (profile != null && profile.isPublic()) {
            // We could add avatar URL to the message model if needed
            // For now, the frontend can fetch profile info separately
            // This method serves as a placeholder for future enhancements
        }

        return enrichedMessage;
    }

    /**
     * Get profile information for message display
     */
    public UserProfile getProfileForMessage(String userId) {
        if (userId == null || userId.isEmpty()) {
            return null;
        }

        return profileRepository.findByUserId(userId)
            .filter(UserProfile::isPublic)
            .orElse(null);
    }

    /**
     * Update last active timestamp when user sends a message
     */
    public void updateLastActiveFromMessage(String userId) {
        if (userId != null && !userId.isEmpty()) {
            profileService.updateLastActive(userId);
        }
    }
}