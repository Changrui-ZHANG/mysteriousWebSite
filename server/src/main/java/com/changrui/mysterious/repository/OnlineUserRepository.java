package com.changrui.mysterious.repository;

import com.changrui.mysterious.model.OnlineUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface OnlineUserRepository extends JpaRepository<OnlineUser, String> {

    @Query("SELECT COUNT(u) FROM OnlineUser u WHERE u.lastHeartbeat > :threshold")
    long countActiveUsers(@Param("threshold") LocalDateTime threshold);

    @Modifying
    @Query("DELETE FROM OnlineUser u WHERE u.lastHeartbeat < :threshold")
    void deleteInactiveUsers(@Param("threshold") LocalDateTime threshold);
}
