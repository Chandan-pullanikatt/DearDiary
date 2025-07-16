import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentTextIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Header from "../../components/layout/Header";
import NoteCard from "../../components/ui/NoteCard";
import NewNoteModal from "../../components/modals/NewNoteModal";
import notesData from '../../data/notes.json';
import utils from '../../utils/localstorage';
import types from '../../config/types';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from localStorage or initialize with default data
  useEffect(() => {
    const loadNotes = () => {
      const storedNotes = utils.getFromLocalStorage(types.NOTES_DATA);
      if (storedNotes && storedNotes.length > 0) {
        setNotes(storedNotes);
      } else {
        // Initialize with default notes and save to localStorage
        const initialNotes = notesData.map(note => ({
          ...note,
          updatedAt: note.createdAt
        }));
        setNotes(initialNotes);
        utils.addtoLocalStorage(types.NOTES_DATA, initialNotes);
      }
      setIsLoading(false);
    };

    // Simulate loading for better UX
    setTimeout(loadNotes, 500);
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (notes.length > 0 && !isLoading) {
      utils.addtoLocalStorage(types.NOTES_DATA, notes);
    }
  }, [notes, isLoading]);

  // Filter notes based on search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes;
    
    return notes.filter(note =>
      note.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm]);

  const handleSaveNote = (noteData) => {
    if (editNote) {
      // Update existing note
      setNotes(prev => 
        prev.map(note => 
          note.id === noteData.id ? noteData : note
        )
      );
    } else {
      // Add new note
      setNotes(prev => [noteData, ...prev]);
    }
    setEditNote(null);
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleEditNote = (note) => {
    setEditNote(note);
    setIsModalOpen(true);
  };

  const handleAddNote = () => {
    setEditNote(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditNote(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const greetingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="loading-dots text-blue-500 mb-4">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your notes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddNote={handleAddNote}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Greeting Section */}
          <motion.div
            variants={greetingVariants}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gradient">
              Hello, Chandan! 👋
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {filteredNotes.length === 0 && searchTerm
                ? `No notes found for "${searchTerm}"`
                : filteredNotes.length === 0
                ? "Start creating your first note to organize your thoughts!"
                : `${filteredNotes.length} ${filteredNotes.length === 1 ? 'note' : 'notes'} ${searchTerm ? 'found' : 'ready for you'}`
              }
            </p>
          </motion.div>

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              layout
            >
              <AnimatePresence>
                {filteredNotes.map((note, index) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    index={index}
                    onDelete={handleDeleteNote}
                    onEdit={handleEditNote}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : !searchTerm ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center py-16"
            >
              <div className="glass-card max-w-md mx-auto p-8">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No notes yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first note to get started!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNote}
                  className="btn-primary"
                >
                  Create First Note
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="glass-card max-w-md mx-auto p-8">
                <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search terms
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchTerm('')}
                  className="btn-secondary"
                >
                  Clear Search
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* New Note Modal */}
      <NewNoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        editNote={editNote}
      />
    </div>
  );
}

export default Notes;
