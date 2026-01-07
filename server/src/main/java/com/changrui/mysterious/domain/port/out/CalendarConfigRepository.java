package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.calendar.CalendarConfig;
import java.util.Optional;

public interface CalendarConfigRepository {
    Optional<CalendarConfig> findGlobal();

    CalendarConfig save(CalendarConfig config);
}
