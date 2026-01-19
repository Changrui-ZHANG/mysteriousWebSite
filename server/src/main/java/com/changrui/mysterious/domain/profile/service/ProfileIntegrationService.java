package com.changrui.mysterious.domain.profile.service;

import com.changrui.mysterious.domain.messagewall.dto.MessageResponse;
import com.changrui.mysterious.domain.messagewall.mapper.MessageMapper;
import com.changrui.mysterious.domain.messagewall.model.Message;
import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for integrating profile information with other domain features.
 */

@Service
public class ProfileIntegrationService {

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private MessageMapper messageMapper;

    /**
     * Enrich messages with profile information and convert to DTOs
     */
    public List<MessageResponse> enrichMessagesWithProfiles(List<Message> messages) {
        if (messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }

        // Get unique user IDs from messages
        List<String> userIds = messages.stream()
                .map(Message::getUserId)
                .filter(userId -> userId != null && !userId.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        Map<String, UserProfile> profileMap;
        if (userIds.isEmpty()) {
            profileMap = Collections.emptyMap();
        } else {
            // Fetch profiles for these users
            profileMap = profileRepository.findAllById(userIds)
                    .stream()
                    .collect(Collectors.toMap(UserProfile::getUserId, profile -> profile));
        }

        // Convert to DTO and enrich
        return messages.stream()
                .map(message -> enrichMessageWithProfile(message, profileMap.get(message.getUserId())))
                .collect(Collectors.toList());
    }

    /**
     * Enrich a single message with profile information and convert to DTO
     */
    public MessageResponse enrichMessageWithProfile(Message message, UserProfile profile) {
        if (message == null) {
            return null;
        }

        // Use new Mapper capability
        String avatarUrl = null;
        if (profile != null && profile.isPublic()) {
            avatarUrl = profile.getResolvedAvatarUrl();
        }

        return messageMapper.toDtoWithAvatar(message, avatarUrl);
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
