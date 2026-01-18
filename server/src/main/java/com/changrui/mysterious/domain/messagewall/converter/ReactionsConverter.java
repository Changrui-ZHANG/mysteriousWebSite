package com.changrui.mysterious.domain.messagewall.converter;

import com.changrui.mysterious.domain.messagewall.model.MessageReaction;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA AttributeConverter for converting List<MessageReaction> to JSON String
 * and vice versa.
 */
@Converter
public class ReactionsConverter implements AttributeConverter<List<MessageReaction>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<MessageReaction> reactions) {
        if (reactions == null || reactions.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(reactions);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @Override
    public List<MessageReaction> convertToEntityAttribute(String json) {
        if (json == null || json.isEmpty() || json.equals("null")) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<MessageReaction>>() {
            });
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }
}
