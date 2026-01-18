package com.changrui.mysterious.domain.game.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing the enabled/disabled status of a game.
 * Maps to the 'game_status' table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "game_status")
public class GameStatus {

    @Id
    @Column(name = "game_type")
    private String gameType;

    @Column(nullable = false)
    private boolean enabled = true;
}
