package com.changrui.mysterious.repository;

import com.changrui.mysterious.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findAllByOrderByTimestampAsc();

    void deleteByIdAndUserId(String id, String userId);
}
