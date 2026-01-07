package com.changrui.mysterious.domain.messagewall.service;

import com.changrui.mysterious.domain.messagewall.model.ChatSetting;
import com.changrui.mysterious.domain.messagewall.model.Message;
import com.changrui.mysterious.domain.messagewall.repository.ChatSettingRepository;
import com.changrui.mysterious.domain.messagewall.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderByTimestampAsc();
    }

    public Message addMessage(Message message) {
        return messageRepository.save(message);
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
}
