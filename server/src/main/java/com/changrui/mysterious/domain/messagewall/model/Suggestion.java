package com.changrui.mysterious.domain.messagewall.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a user suggestion.
 * Maps to the 'suggestions' table in the database.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "suggestions")
public class Suggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, length = 1000)
    private String suggestion;

    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false)
    private String status = "pending";

    public Suggestion(String userId, String username, String suggestion) {
        this.userId = userId;
        this.username = username;
        this.suggestion = suggestion;
        this.timestamp = LocalDateTime.now();
        this.status = "pending";
    }
}
