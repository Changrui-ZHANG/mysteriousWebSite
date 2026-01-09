import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaTrash, FaSave, FaPen } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../shared/contexts/AuthContext';
import { LoginRequired } from '../../shared/components';
import { API_ENDPOINTS } from '../../shared/constants/endpoints';
import { postJson, deleteJson, putJson } from '../../shared/api/httpClient';

interface Note {
    id: string;
    userId: string;
    username: string;
    title: string;
    content: string;
    color: string;
    createdAt: string;
    updatedAt?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

const COLORS = [
    'bg-red-500/30',
    'bg-orange-500/30',
    'bg-amber-500/30',
    'bg-green-500/30',
    'bg-emerald-500/30',
    'bg-teal-500/30',
    'bg-cyan-500/30',
    'bg-sky-500/30',
    'bg-blue-500/30',
    'bg-indigo-500/30',
    'bg-violet-500/30',
    'bg-purple-500/30',
    'bg-fuchsia-500/30',
    'bg-pink-500/30',
    'bg-rose-500/30',
];

export const NotesPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[8]);

    // Fetch notes from API
    const fetchNotes = useCallback(async () => {
        if (!user?.userId) {
            setIsLoading(false);
            return;
        }

        console.log('Fetching notes for user:', user.userId);
        console.log('API endpoint:', API_ENDPOINTS.NOTES.LIST(user.userId));

        try {
            const response = await fetch(API_ENDPOINTS.NOTES.LIST(user.userId));
            console.log('Fetch response status:', response.status);

            if (response.ok) {
                const result: ApiResponse<Note[]> = await response.json();
                console.log('Fetch result:', result);

                if (result.success && result.data) {
                    setNotes(result.data);
                } else {
                    console.error('API returned error:', result.message);
                    setNotes([]);
                }
            } else {
                console.error('Failed to fetch notes:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setNotes([]);
            }
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            setNotes([]);
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleSaveNote = async () => {
        if (!title.trim() || !user) return;

        const noteData = {
            userId: user.userId,
            username: user.username,
            title: title.trim(),
            content: content.trim(),
            color: selectedColor,
        };

        console.log('Saving note with data:', noteData);
        console.log('API endpoint:', editingId ? API_ENDPOINTS.NOTES.UPDATE(editingId, user.userId) : API_ENDPOINTS.NOTES.CREATE);

        try {
            if (editingId) {
                const result = await putJson(API_ENDPOINTS.NOTES.UPDATE(editingId, user.userId), noteData);
                console.log('Update result:', result);
                // Mettre à jour la note dans la liste locale
                setNotes(prevNotes =>
                    prevNotes.map(note =>
                        note.id === editingId ? result as Note : note
                    )
                );
            } else {
                const result = await postJson(API_ENDPOINTS.NOTES.CREATE, noteData);
                console.log('Create result:', result);
                // Ajouter la nouvelle note au début de la liste locale
                setNotes(prevNotes => [result as Note, ...prevNotes]);
            }
            resetForm();
        } catch (error) {
            console.error('Failed to save note:', error);
            // Add user-friendly error feedback
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to save note: ${errorMessage}. Please try again.`);
        }
    };

    const handleDeleteNote = async (noteId: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        if (!user) return;

        // Add confirmation dialog
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            await deleteJson(API_ENDPOINTS.NOTES.DELETE(noteId, user.userId));
            // Supprimer la note de la liste locale
            setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        } catch (error) {
            console.error('Failed to delete note:', error);
            alert('Failed to delete note. Please try again.');
        }
    };

    const startEdit = (note: Note) => {
        setEditingId(note.id);
        setTitle(note.title);
        setContent(note.content);
        setSelectedColor(note.color);
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setTitle('');
        setContent('');
        setSelectedColor(COLORS[8]);
    };

    const notesIcon = (
        <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );

    return (
        <LoginRequired
            title={t('notes.login_required_title')}
            description={t('notes.login_hint')}
            icon={notesIcon}
        >
            <div className="page-container min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background elements */}
                <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <h1 className="text-4xl font-bold text-primary tracking-tight drop-shadow-lg">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
                                Liquid Notes
                            </span>
                        </h1>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="group flex items-center gap-2 px-6 py-3 bg-surface-translucent hover:bg-inset border border-default backdrop-blur-md rounded-full text-primary transition-all duration-300 shadow-lg hover:shadow-accent-primary/20"
                        >
                            <FaPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-medium">New Note</span>
                        </button>
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="text-center py-20">
                            <div className="animate-spin w-8 h-8 border-2 border-default border-t-accent-primary rounded-full mx-auto"></div>
                            <p className="text-muted mt-4">Chargement...</p>
                        </div>
                    )}

                    {/* Notes Grid */}
                    {!isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {notes.map((note) => (
                                    <motion.div
                                        key={note.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        onClick={() => startEdit(note)}
                                        className={`relative group p-6 rounded-2xl border border-default cursor-pointer overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl ${note.color} backdrop-blur-md`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-surface/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-xl font-semibold text-primary truncate pr-8">{note.title || 'Untitled'}</h3>
                                                <button
                                                    onClick={(e) => handleDeleteNote(note.id, e)}
                                                    className="absolute top-0 right-0 p-2 text-secondary hover:text-accent-danger transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <FaTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <p className="text-secondary whitespace-pre-wrap line-clamp-6 text-sm leading-relaxed">
                                                {note.content || <span className="italic text-muted">No content...</span>}
                                            </p>
                                            <div className="mt-4 pt-4 border-t border-default flex justify-between items-center text-xs text-muted">
                                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                                <FaPen className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {!isLoading && notes.length === 0 && !isAdding && (
                        <div className="text-center py-20">
                            <div className="inline-block p-6 rounded-full bg-inset backdrop-blur-sm border border-default mb-4">
                                <FaPen className="w-12 h-12 text-muted" />
                            </div>
                            <p className="text-xl text-secondary font-light">Your canvas is empty.</p>
                            <p className="text-muted mt-2">Create a new note to get started.</p>
                        </div>
                    )}
                </div>

                {/* Editor Modal */}
                {createPortal(
                    <AnimatePresence>
                        {isAdding && (
                            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={resetForm}
                                    className="absolute inset-0 bg-overlay backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative w-full max-w-2xl bg-surface-translucent border border-default backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
                                >
                                    <div className="flex justify-between items-center p-6 border-b border-default bg-inset">
                                        <h2 className="text-2xl font-bold text-primary">{editingId ? 'Edit Note' : 'New Note'}</h2>
                                        <button
                                            onClick={resetForm}
                                            className="p-2 rounded-full hover:bg-surface-alt text-secondary transition-colors"
                                        >
                                            <FaTimes className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-transparent text-3xl font-bold text-primary placeholder-muted border-none outline-none focus:ring-0"
                                            autoFocus
                                        />
                                        <div className="h-px w-full bg-gradient-to-r from-default to-transparent"></div>

                                        <textarea
                                            placeholder="Write your thoughts..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="w-full h-64 bg-transparent text-primary placeholder-muted border-none outline-none resize-none focus:ring-0"
                                        />

                                        <div className="space-y-4">
                                            <p className="text-sm font-medium text-secondary">Choose a color</p>
                                            <div className="flex flex-wrap gap-3">
                                                {COLORS.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setSelectedColor(color)}
                                                        className={`w-8 h-8 rounded-full border-2 transition-all ${color} ${selectedColor === color ? 'border-accent-primary scale-110' : 'border-default hover:scale-105'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 p-6 border-t border-default bg-inset">
                                        <button
                                            onClick={resetForm}
                                            className="px-6 py-3 text-secondary hover:text-primary transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveNote}
                                            disabled={!title.trim()}
                                            className="flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-white rounded-xl transition-all"
                                        >
                                            <FaSave className="w-4 h-4" />
                                            {editingId ? 'Update' : 'Save'}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        </LoginRequired>
    );
};