package com.changrui.mysterious.domain.port.out;

import com.changrui.mysterious.domain.model.game.GameStatus;
import java.util.List;
import java.util.Optional;

public interface GameStatusRepository {
    Optional<GameStatus> findByGameType(String gameType);

    List<GameStatus> findAll();

    GameStatus save(GameStatus gameStatus);

    void deleteByGameType(String gameType);
}
