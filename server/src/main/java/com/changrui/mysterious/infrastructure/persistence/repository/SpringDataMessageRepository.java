package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.infrastructure.persistence.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataMessageRepository extends JpaRepository<MessageEntity, Long> {
    List<MessageEntity> findTop100ByIsVisibleTrueOrderByCreatedAtDesc();
}
