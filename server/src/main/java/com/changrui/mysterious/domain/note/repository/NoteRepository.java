package com.changrui.mysterious.domain.note.repository;

import com.changrui.mysterious.domain.note.model.Note;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Note entity operations.
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, String> {

    List<Note> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Note> findAllByOrderByCreatedAtDesc();

    void deleteByIdAndUserId(String id, String userId);
}
