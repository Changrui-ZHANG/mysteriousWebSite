package com.changrui.mysterious.domain.system.repository;

import com.changrui.mysterious.domain.system.model.CalendarConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for CalendarConfig entity operations.
 */
@Repository
public interface CalendarConfigRepository extends JpaRepository<CalendarConfig, String> {
}
