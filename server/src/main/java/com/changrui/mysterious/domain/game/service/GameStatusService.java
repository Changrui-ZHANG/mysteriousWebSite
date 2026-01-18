package com.changrui.mysterious.domain.game.service;

import com.changrui.mysterious.domain.game.model.GameStatus;
import com.changrui.mysterious.domain.game.repository.GameStatusRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing game status (enabled/disabled).
 */
@Service
public class GameStatusService {

    @Autowired
    private GameStatusRepository gameStatusRepository;

    /**
     * Get all game statuses.
     */
    public List<GameStatus> getAllStatuses() {
        return gameStatusRepository.findAll();
    }

    /**
     * Toggle the enabled state of a game.
     */
    @Transactional
    public GameStatus toggleGame(String gameType) {
        GameStatus status = gameStatusRepository.findById(gameType)
                .map(existing -> {
                    existing.setEnabled(!existing.isEnabled());
                    return existing;
                })
                .orElseGet(() -> new GameStatus(gameType, false));

        return gameStatusRepository.save(status);
    }
}
