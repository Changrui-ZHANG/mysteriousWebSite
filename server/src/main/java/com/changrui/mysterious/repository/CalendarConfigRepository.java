package com.changrui.mysterious.repository;

import com.changrui.mysterious.model.CalendarConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarConfigRepository extends JpaRepository<CalendarConfig, String> {
}
