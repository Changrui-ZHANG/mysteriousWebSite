package com.changrui.mysterious.domain.calendar.repository;

import com.changrui.mysterious.domain.calendar.model.CalendarConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for CalendarConfig entity operations.
 */
@Repository
public interface CalendarConfigRepository extends JpaRepository<CalendarConfig, String> {
}
