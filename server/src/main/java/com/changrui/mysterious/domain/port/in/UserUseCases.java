package com.changrui.mysterious.domain.port.in;

import com.changrui.mysterious.domain.model.user.User;
import java.util.Optional;

public interface UserUseCases {
    Optional<User> getUserById(String userId);

    void updatePreferredLanguage(String userId, String language);

    String getPreferredLanguage(String userId);
}
