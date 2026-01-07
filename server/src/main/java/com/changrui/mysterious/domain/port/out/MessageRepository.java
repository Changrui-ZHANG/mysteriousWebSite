package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.message.Message;
import java.util.List;

public interface MessageRepository {
    Message save(Message message);

    List<Message> findRecentMessages(int limit);

    void deleteById(Long id);

    void deleteAll();

    java.util.Optional<Message> findById(Long id);
}
