package com.changrui.mysterious.domain.system.repository;

import com.changrui.mysterious.domain.system.model.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for SystemSetting entity operations.
 */
@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {
}
