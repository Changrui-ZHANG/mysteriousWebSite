package com.changrui.mysterious.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vocabulary_items")
public class VocabularyItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(columnDefinition = "TEXT", unique = true)
    private String expression;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(name = "meaning_en", columnDefinition = "TEXT")
    private String meaningEn;

    @Column(name = "meaning_zh", columnDefinition = "TEXT")
    private String meaningZh;

    @Column(columnDefinition = "TEXT")
    private String example;

    private String level;

    public VocabularyItem() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getExpression() {
        return expression;
    }

    public void setExpression(String expression) {
        this.expression = expression;
    }

    public String getMeaning() {
        return meaning;
    }

    public void setMeaning(String meaning) {
        this.meaning = meaning;
    }

    public String getMeaningEn() {
        return meaningEn;
    }

    public void setMeaningEn(String meaningEn) {
        this.meaningEn = meaningEn;
    }

    public String getMeaningZh() {
        return meaningZh;
    }

    public void setMeaningZh(String meaningZh) {
        this.meaningZh = meaningZh;
    }

    public String getExample() {
        return example;
    }

    public void setExample(String example) {
        this.example = example;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }
}
