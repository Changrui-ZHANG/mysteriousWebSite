package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.infrastructure.persistence.entity.OnlineUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface SpringDataOnlineUserRepository extends JpaRepository<OnlineUserEntity, String> {

    @Query("SELECT COUNT(u) FROM OnlineUserEntity u WHERE u.lastHeartbeat > :threshold")
    long countActiveUsers(@Param("threshold") LocalDateTime threshold);

    @Modifying
    @Query("DELETE FROM OnlineUserEntity u WHERE u.lastHeartbeat <= :threshold")
    void deleteInactiveUsers(@Param("threshold") LocalDateTime threshold);
}
