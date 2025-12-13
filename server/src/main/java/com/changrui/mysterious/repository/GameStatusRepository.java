package com.changrui.mysterious.repository;

import com.changrui.mysterious.model.GameStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameStatusRepository extends JpaRepository<GameStatus, String> {
}
