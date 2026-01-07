package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.presence.OnlineUser;
import java.time.LocalDateTime;
import java.util.Optional;

public interface OnlineUserRepository {
    Optional<OnlineUser> findById(String userId);

    OnlineUser save(OnlineUser user);

    long countActiveUsers(LocalDateTime threshold);

    void deleteInactiveUsers(LocalDateTime threshold);
}
