package com.changrui.mysterious.domain.note.repository;

import com.changrui.mysterious.domain.note.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Note entity operations.
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, String> {

    List<Note> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Note> findAllByOrderByCreatedAtDesc();

    void deleteByIdAndUserId(String id, String userId);
}
