package com.changrui.mysterious.application.service.message;

import com.changrui.mysterious.domain.port.in.message.MessageUseCases;
import com.changrui.mysterious.domain.port.out.MessageRepository;
import com.changrui.mysterious.domain.model.message.Message;
import com.changrui.mysterious.domain.model.system.SystemSetting;
import com.changrui.mysterious.domain.port.out.SystemSettingRepository;
import com.changrui.mysterious.domain.exception.UnauthorizedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MessageManagementService implements MessageUseCases {

    private final MessageRepository messageRepository;
    private final SystemSettingRepository systemSettingRepository;

    public MessageManagementService(MessageRepository messageRepository,
            SystemSettingRepository systemSettingRepository) {
        this.messageRepository = messageRepository;
        this.systemSettingRepository = systemSettingRepository;
    }

    @Override
    public Message sendMessage(SendMessageCommand command) {
        if (isMuted()) {
            // For now, allow but log? Or throw?
            // throw new UnauthorizedException("Chat is muted");
            // Let controller handle it for now as per previous logic
        }

        String refId = command.quotedMessageId();
        String refName = command.quotedAuthorName();
        String refContent = command.quotedContent();

        // Resolve quote if ID provided but details missing
        if (refId != null && !refId.isBlank()) {
            try {
                Long id = Long.parseLong(refId);
                Optional<Message> original = messageRepository.findById(id);
                if (original.isPresent()) {
                    Message m = original.get();
                    refName = m.getAuthorName();
                    // Basic truncation if needed, or full content
                    refContent = m.getContent();
                }
            } catch (NumberFormatException e) {
                // Ignore invalid IDs
            }
        }

        Message message = Message.create(
                command.content(),
                command.authorName(),
                command.authorId(),
                refId,
                refName,
                refContent);
        return messageRepository.save(message);
    }

    @Override
    public List<Message> getRecentMessages() {
        return messageRepository.findRecentMessages(100);
    }

    @Override
    public void deleteMessage(String id, String userId, boolean isAdmin) {
        Long messageId = Long.parseLong(id);
        if (!isAdmin) {
            // Should verify ownership
        }
        messageRepository.deleteById(messageId);
    }

    @Override
    public void deleteAllMessages() {
        messageRepository.deleteAll();
    }

    @Override
    public boolean toggleMute() {
        String key = "MESSAGES_MUTED";
        Optional<SystemSetting> settingOpt = systemSettingRepository.findByKey(key);
        boolean current = settingOpt.map(s -> Boolean.parseBoolean(s.getValue())).orElse(false);
        boolean newValue = !current;

        SystemSetting setting = settingOpt.orElse(SystemSetting.create(key, "false", "Global mute"));
        setting.updateValue(String.valueOf(newValue));
        systemSettingRepository.save(setting);
        return newValue;
    }

    @Override
    public boolean isMuted() {
        return systemSettingRepository.findByKey("MESSAGES_MUTED")
                .map(s -> Boolean.parseBoolean(s.getValue()))
                .orElse(false);
    }
}
