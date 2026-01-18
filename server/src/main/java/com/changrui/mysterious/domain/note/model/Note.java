package com.changrui.mysterious.domain.note.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a user note.
 * Maps to the 'notes' table in the database.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "notes", indexes = {
        @Index(name = "idx_note_user", columnList = "user_id")
})
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String color;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Note(String userId, String username, String title, String content, String color) {
        this.userId = userId;
        this.username = username;
        this.title = title;
        this.content = content;
        this.color = color;
        this.createdAt = LocalDateTime.now();
    }
}
