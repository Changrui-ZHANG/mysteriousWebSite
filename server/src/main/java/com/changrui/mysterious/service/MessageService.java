package com.changrui.mysterious.service;

import com.changrui.mysterious.model.Message;
import com.changrui.mysterious.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

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

    private boolean isMuted = false;

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
