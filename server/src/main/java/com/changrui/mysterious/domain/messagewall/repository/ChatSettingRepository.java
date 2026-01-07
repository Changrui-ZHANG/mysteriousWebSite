package com.changrui.mysterious.domain.messagewall.repository;

import com.changrui.mysterious.domain.messagewall.model.ChatSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for ChatSetting entity operations.
 */
@Repository
public interface ChatSettingRepository extends JpaRepository<ChatSetting, String> {
}
