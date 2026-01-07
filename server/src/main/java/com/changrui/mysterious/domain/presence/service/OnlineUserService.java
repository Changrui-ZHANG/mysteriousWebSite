package com.changrui.mysterious.domain.presence.service;

import com.changrui.mysterious.domain.presence.model.OnlineUser;
import com.changrui.mysterious.domain.presence.repository.OnlineUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Service for tracking online users.
 */
@Service
public class OnlineUserService {

    @Autowired
    private OnlineUserRepository onlineUserRepository;

    private AtomicBoolean showOnlineCountToAll = new AtomicBoolean(false);

    @Transactional
    public void updateHeartbeat(String userId) {
        OnlineUser user = onlineUserRepository.findById(userId).orElse(null);
        if (user == null) {
            user = new OnlineUser(userId);
        } else {
            user.updateHeartbeat();
        }
        onlineUserRepository.save(user);
    }

    public long getOnlineCount() {
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(30);
        return onlineUserRepository.countActiveUsers(threshold);
    }

    @Transactional
    @Scheduled(fixedRate = 15000)
    public void cleanupInactiveUsers() {
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(30);
        onlineUserRepository.deleteInactiveUsers(threshold);
    }

    public boolean isShowOnlineCountToAll() {
        return showOnlineCountToAll.get();
    }

    public void toggleShowOnlineCountToAll() {
        showOnlineCountToAll.set(!showOnlineCountToAll.get());
    }
}
