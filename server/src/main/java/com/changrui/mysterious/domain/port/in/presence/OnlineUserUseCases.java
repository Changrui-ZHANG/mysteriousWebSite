package com.changrui.mysterious.domain.port.in.presence;

public interface OnlineUserUseCases {
    void updateHeartbeat(String userId);

    long getOnlineCount();

    boolean isShowOnlineCountToAll();

    void toggleShowOnlineCountToAll();

    void cleanupInactiveUsers();
}
