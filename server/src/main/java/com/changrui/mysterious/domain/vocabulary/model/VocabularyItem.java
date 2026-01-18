package com.changrui.mysterious.domain.vocabulary.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a vocabulary item.
 * Maps to the 'vocabulary_items' table in the database.
 */
@Data
@NoArgsConstructor
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
}
