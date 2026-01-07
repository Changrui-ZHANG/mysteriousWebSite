package com.changrui.mysterious.domain.model.vocabulary;

public class VocabularyItem {

    private final Integer id;
    private final String expression;
    private final String meaning;
    private final String meaningEn;
    private final String meaningZh;
    private final String example;
    private final String level;

    private VocabularyItem(Integer id, String expression, String meaning, String meaningEn, String meaningZh,
            String example, String level) {
        this.id = id;
        this.expression = expression;
        this.meaning = meaning;
        this.meaningEn = meaningEn;
        this.meaningZh = meaningZh;
        this.example = example;
        this.level = level;
    }

    public static VocabularyItem create(String expression, String meaning, String meaningEn, String meaningZh,
            String example, String level) {
        return new VocabularyItem(null, expression, meaning, meaningEn, meaningZh, example, level);
    }

    public static VocabularyItem reconstitute(Integer id, String expression, String meaning, String meaningEn,
            String meaningZh, String example, String level) {
        return new VocabularyItem(id, expression, meaning, meaningEn, meaningZh, example, level);
    }

    public Integer getId() {
        return id;
    }

    public String getExpression() {
        return expression;
    }

    public String getMeaning() {
        return meaning;
    }

    public String getMeaningEn() {
        return meaningEn;
    }

    public String getMeaningZh() {
        return meaningZh;
    }

    public String getExample() {
        return example;
    }

    public String getLevel() {
        return level;
    }
}
