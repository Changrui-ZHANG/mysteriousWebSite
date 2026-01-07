package com.changrui.mysterious.domain.game.repository;

import com.changrui.mysterious.domain.game.model.GameStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for GameStatus entity operations.
 */
@Repository
public interface GameStatusRepository extends JpaRepository<GameStatus, String> {
}
