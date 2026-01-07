package com.changrui.mysterious.domain.port.in.calendar;

import com.changrui.mysterious.domain.model.calendar.CalendarConfig;
import java.util.List;

public interface CalendarUseCases {
    CalendarConfig getConfig();

    CalendarConfig updateZones(List<String> zones, String adminCode);
}
