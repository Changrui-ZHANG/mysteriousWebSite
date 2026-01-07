package com.changrui.mysterious.application.dto.vocabulary;

public record VocabularyDTO(
        Integer id,
        String expression,
        String meaning,
        String meaningEn,
        String meaningZh,
        String example,
        String level) {
}
