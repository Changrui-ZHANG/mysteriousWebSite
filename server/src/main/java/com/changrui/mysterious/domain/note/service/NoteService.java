package com.changrui.mysterious.domain.note.service;

import com.changrui.mysterious.domain.note.dto.NoteDTO;
import com.changrui.mysterious.domain.note.model.Note;
import com.changrui.mysterious.domain.note.repository.NoteRepository;
import com.changrui.mysterious.shared.exception.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing user notes.
 */
@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    /**
     * Get all notes for a specific user.
     */
    public List<Note> getNotesByUserId(String userId) {
        return noteRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get all notes (super-admin only).
     */
    public List<Note> getAllNotes() {
        return noteRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Create a new note.
     */
    @Transactional
    public Note createNote(NoteDTO dto) {
        Note note = new Note(
            dto.userId(),
            dto.username(),
            dto.title(),
            dto.content(),
            dto.color()
        );
        return noteRepository.save(note);
    }

    /**
     * Update an existing note.
     */
    @Transactional
    public Note updateNote(String id, String userId, NoteDTO dto) {
        Note note = noteRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Note", id));

        if (!note.getUserId().equals(userId)) {
            throw new SecurityException("Not authorized to update this note");
        }

        note.setTitle(dto.title());
        note.setContent(dto.content());
        note.setColor(dto.color());
        note.setUpdatedAt(LocalDateTime.now());

        return noteRepository.save(note);
    }

    /**
     * Update note as super-admin (can update any note).
     */
    @Transactional
    public Note updateNoteAsAdmin(String id, NoteDTO dto) {
        Note note = noteRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Note", id));

        note.setTitle(dto.title());
        note.setContent(dto.content());
        note.setColor(dto.color());
        note.setUpdatedAt(LocalDateTime.now());

        return noteRepository.save(note);
    }

    /**
     * Delete a note (owner only).
     */
    @Transactional
    public void deleteNote(String id, String userId) {
        Note note = noteRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Note", id));

        if (!note.getUserId().equals(userId)) {
            throw new SecurityException("Not authorized to delete this note");
        }

        noteRepository.deleteById(id);
    }

    /**
     * Delete note as super-admin (can delete any note).
     */
    @Transactional
    public void deleteNoteAsAdmin(String id) {
        if (!noteRepository.existsById(id)) {
            throw new EntityNotFoundException("Note", id);
        }
        noteRepository.deleteById(id);
    }
}
