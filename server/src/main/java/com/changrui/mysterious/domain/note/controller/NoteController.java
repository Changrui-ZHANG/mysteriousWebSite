package com.changrui.mysterious.domain.note.controller;

import com.changrui.mysterious.domain.note.dto.NoteDTO;
import com.changrui.mysterious.domain.note.model.Note;
import com.changrui.mysterious.domain.note.service.NoteService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing user notes.
 */
@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @Autowired
    private AdminService adminService;

    /**
     * Get notes for a user, or all notes if super-admin.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Note>>> getNotes(
            @RequestParam String userId,
            @RequestParam(required = false) String adminCode) {

        // Super-admin can see all notes
        if (adminService.isSuperAdmin(adminCode)) {
            return ResponseEntity.ok(ApiResponse.success(noteService.getAllNotes()));
        }

        // Regular user sees only their notes
        return ResponseEntity.ok(ApiResponse.success(noteService.getNotesByUserId(userId)));
    }

    /**
     * Get all notes (super-admin only).
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Note>>> getAllNotes(
            @RequestParam String adminCode) {

        if (!adminService.isSuperAdmin(adminCode)) {
            throw new UnauthorizedException("Super admin access required");
        }

        return ResponseEntity.ok(ApiResponse.success(noteService.getAllNotes()));
    }

    /**
     * Create a new note.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Note>> createNote(
            @Valid @RequestBody NoteDTO dto) {

        Note created = noteService.createNote(dto);
        return ResponseEntity.ok(ApiResponse.success("Note created", created));
    }

    /**
     * Update a note.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Note>> updateNote(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam(required = false) String adminCode,
            @Valid @RequestBody NoteDTO dto) {

        Note updated;
        if (adminService.isSuperAdmin(adminCode)) {
            updated = noteService.updateNoteAsAdmin(id, dto);
        } else {
            updated = noteService.updateNote(id, userId, dto);
        }

        return ResponseEntity.ok(ApiResponse.success("Note updated", updated));
    }

    /**
     * Delete a note.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam(required = false) String adminCode) {

        if (adminService.isSuperAdmin(adminCode)) {
            noteService.deleteNoteAsAdmin(id);
        } else {
            noteService.deleteNote(id, userId);
        }

        return ResponseEntity.ok(ApiResponse.successMessage("Note deleted"));
    }
}
