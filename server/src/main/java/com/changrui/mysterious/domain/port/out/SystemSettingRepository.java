package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.system.SystemSetting;
import java.util.List;
import java.util.Optional;

public interface SystemSettingRepository {
    List<SystemSetting> findAll();

    Optional<SystemSetting> findByKey(String key);

    SystemSetting save(SystemSetting setting);

    boolean existsByKey(String key);
}
