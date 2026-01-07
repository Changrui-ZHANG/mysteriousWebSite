package com.changrui.mysterious.domain.community.service;

import com.changrui.mysterious.domain.community.model.Message;
import com.changrui.mysterious.domain.community.repository.MessageRepository;
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

    private boolean isMuted = false;

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
        return isMuted;
    }

    public void setMuted(boolean muted) {
        isMuted = muted;
    }

    public void clearAllMessages() {
        messageRepository.deleteAll();
    }
}
