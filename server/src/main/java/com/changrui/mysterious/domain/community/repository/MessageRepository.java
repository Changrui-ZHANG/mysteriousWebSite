package com.changrui.mysterious.domain.community.repository;

import com.changrui.mysterious.domain.community.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Message entity operations.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    List<Message> findAllByOrderByTimestampAsc();

    void deleteByIdAndUserId(String id, String userId);
}
