package com.changrui.mysterious.application.service.user;

import com.changrui.mysterious.domain.model.user.User;
import com.changrui.mysterious.domain.model.user.UserId;
import com.changrui.mysterious.domain.port.in.UserUseCases;
import com.changrui.mysterious.domain.port.out.UserRepository;
import com.changrui.mysterious.domain.exception.UserNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserManagementService implements UserUseCases {

    private final UserRepository userRepository;

    public UserManagementService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Optional<User> getUserById(String userId) {
        return userRepository.findById(UserId.of(userId));
    }

    @Override
    public void updatePreferredLanguage(String userId, String language) {
        User user = userRepository.findById(UserId.of(userId))
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        user.changePreferredLanguage(language);
        userRepository.save(user);
    }

    @Override
    public String getPreferredLanguage(String userId) {
        return userRepository.findById(UserId.of(userId))
                .map(User::getPreferredLanguage)
                .orElse("fr"); // Default
    }
}
