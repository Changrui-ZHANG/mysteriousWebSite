import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaTrash, FaSave, FaPen } from 'react-icons/fa';

interface Note {
    id: string;
    title: string;
    content: string;
    color: string;
    createdAt: number;
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
    const [notes, setNotes] = useState<Note[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[8]); // Default blue-ish

    // Load notes from localStorage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('liquid_notes');
        if (savedNotes) {
            try {
                setNotes(JSON.parse(savedNotes));
            } catch (e) {
                console.error("Failed to parse notes", e);
            }
        }
    }, []);

    // Save notes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('liquid_notes', JSON.stringify(notes));
    }, [notes]);

    const handleSaveNote = () => {
        if (!title.trim() && !content.trim()) return;

        if (editingId) {
            setNotes(notes.map(n => n.id === editingId ? { ...n, title, content, color: selectedColor } : n));
            setEditingId(null);
        } else {
            const newNote: Note = {
                id: Date.now().toString(),
                title,
                content,
                color: selectedColor,
                createdAt: Date.now(),
            };
            setNotes([newNote, ...notes]);
        }
        resetForm();
    };

    const handleDeleteNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotes(notes.filter(n => n.id !== id));
    };

    const startEdit = (note: Note) => {
        setEditingId(note.id);
        setTitle(note.title);
        setContent(note.content);
        setSelectedColor(note.color);
        setIsAdding(true);
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setSelectedColor(COLORS[8]);
        setIsAdding(false);
        setEditingId(null);
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements for glass effect enhancement */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
                            Liquid Notes
                        </span>
                    </h1>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="group flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-white transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                    >
                        <FaPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-medium">New Note</span>
                    </button>
                </div>

                {/* Notes Grid */}
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
                                className={`relative group p-6 rounded-2xl border border-white/10 cursor-pointer overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl ${note.color} backdrop-blur-md`}
                            >
                                {/* Glass shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-semibold text-white/90 truncate pr-8">{note.title || 'Untitled'}</h3>
                                        <button
                                            onClick={(e) => handleDeleteNote(note.id, e)}
                                            className="absolute top-0 right-0 p-2 text-white/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <FaTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-blue-100/80 whitespace-pre-wrap line-clamp-6 text-sm leading-relaxed">
                                        {note.content || <span className="italic opacity-50">No content...</span>}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-blue-200/50">
                                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                        <FaPen className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {notes.length === 0 && !isAdding && (
                    <div className="text-center py-20">
                        <div className="inline-block p-6 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
                            <FaPen className="w-12 h-12 text-white/20" />
                        </div>
                        <p className="text-xl text-white/40 font-light">Your canvas is empty.</p>
                        <p className="text-white/20 mt-2">Create a new note to get started.</p>
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetForm}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-gray-900/80 border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                                <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Note' : 'New Note'}</h2>
                                <button
                                    onClick={resetForm}
                                    className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors"
                                >
                                    <FaTimes className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-transparent text-3xl font-bold text-white placeholder-white/20 border-none outline-none focus:ring-0"
                                    autoFocus
                                />
                                <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent"></div>
                                <textarea
                                    placeholder="Start typing your thoughts..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-64 bg-transparent text-lg text-blue-100 placeholder-white/20 border-none outline-none focus:ring-0 resize-none custom-scrollbar"
                                />

                                {/* Color Picker */}
                                <div className="flex flex-wrap gap-3 pt-4">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full transition-all duration-300 ${color} border-2 ${selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-2 rounded-xl text-white/70 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    className="px-8 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-medium rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center gap-2"
                                >
                                    <FaSave className="w-4 h-4" />
                                    Save Note
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
