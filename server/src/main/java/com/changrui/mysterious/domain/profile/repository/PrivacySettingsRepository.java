package com.changrui.mysterious.domain.profile.repository;

import com.changrui.mysterious.domain.profile.model.PrivacySettings;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for PrivacySettings entity operations.
 */
@Repository
public interface PrivacySettingsRepository extends JpaRepository<PrivacySettings, String> {

    /**
     * Find privacy settings by user ID
     */
    Optional<PrivacySettings> findByUserId(String userId);

    /**
     * Check if privacy settings exist for user
     */
    boolean existsByUserId(String userId);

    /**
     * Find rows for several users at once
     */
    List<PrivacySettings> findByUserIdIn(Collection<String> userIds);
}