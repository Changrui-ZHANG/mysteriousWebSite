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
 * This ensures proper serialization/deserialization for all JPA queries (JPQL,
 * native, findById, etc.)
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
            String json = objectMapper.writeValueAsString(reactions);
            System.out.println("[ReactionsConverter] convertToDatabaseColumn: " + json);
            return json;
        } catch (JsonProcessingException e) {
            System.out.println("[ReactionsConverter] Error serializing reactions: " + e.getMessage());
            return null;
        }
    }

    @Override
    public List<MessageReaction> convertToEntityAttribute(String json) {
        System.out.println("[ReactionsConverter] convertToEntityAttribute: " + json);
        if (json == null || json.isEmpty() || json.equals("null")) {
            return new ArrayList<>();
        }
        try {
            List<MessageReaction> reactions = objectMapper.readValue(json,
                    new TypeReference<List<MessageReaction>>() {
                    });
            System.out.println("[ReactionsConverter] Loaded " + reactions.size() + " reactions");
            return reactions;
        } catch (JsonProcessingException e) {
            System.out.println("[ReactionsConverter] Error deserializing reactions: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}
