package com.changrui.mysterious.application.service.presence;

import com.changrui.mysterious.domain.model.presence.OnlineUser;
import com.changrui.mysterious.domain.port.in.presence.OnlineUserUseCases;
import com.changrui.mysterious.domain.port.out.OnlineUserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@Transactional
public class OnlineUserManagementService implements OnlineUserUseCases {

    private final OnlineUserRepository repository;
    private final AtomicBoolean showOnlineCountToAll = new AtomicBoolean(false);

    public OnlineUserManagementService(OnlineUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public void updateHeartbeat(String userId) {
        OnlineUser user = repository.findById(userId)
                .map(u -> {
                    u.updateHeartbeat();
                    return u;
                })
                .orElseGet(() -> OnlineUser.create(userId));
        repository.save(user);
    }

    @Override
    public long getOnlineCount() {
        // Consider users active if they sent heartbeat in last 30 seconds
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(30);
        return repository.countActiveUsers(threshold);
    }

    @Override
    public boolean isShowOnlineCountToAll() {
        return showOnlineCountToAll.get();
    }

    @Override
    public void toggleShowOnlineCountToAll() {
        showOnlineCountToAll.set(!showOnlineCountToAll.get());
    }

    @Override
    @Scheduled(fixedRate = 15000) // Run every 15 seconds
    public void cleanupInactiveUsers() {
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(30);
        repository.deleteInactiveUsers(threshold);
    }
}
