package com.changrui.mysterious.infrastructure.persistence.repository;

import com.changrui.mysterious.domain.model.message.Message;
import com.changrui.mysterious.domain.port.out.MessageRepository;
import com.changrui.mysterious.infrastructure.persistence.entity.MessageEntity;
import com.changrui.mysterious.infrastructure.persistence.mapper.MessageMapper;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class JpaMessageRepository implements MessageRepository {

    private final SpringDataMessageRepository jpaRepository;
    private final MessageMapper mapper;

    public JpaMessageRepository(SpringDataMessageRepository jpaRepository, MessageMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    @NonNull
    public Message save(@NonNull Message message) {
        MessageEntity entity = mapper.toEntity(message);
        if (entity == null) {
            throw new IllegalArgumentException("Cannot save a null message");
        }
        MessageEntity saved = jpaRepository.save(entity);
        return Objects.requireNonNull(mapper.toDomain(saved));
    }

    @Override
    public List<Message> findRecentMessages(int limit) {
        // Note: limit is hardcoded to 100 in Spring Data query for now, can be dynamic
        // if needed
        return jpaRepository.findTop100ByIsVisibleTrueOrderByCreatedAtDesc()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteAll() {
        jpaRepository.deleteAll();
    }

    @Override
    public java.util.Optional<Message> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }
}
