import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../config/supabase'

const NotesPage = () => {
  const [notes, setNotes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Modal form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const { getUserId, signOut } = useAuth()
  const { toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Load notes from Supabase - wrapped in useCallback to fix dependency warning
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true)
      const userId = getUserId()
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
      setError('Failed to load notes')
    } finally {
      setIsLoading(false)
    }
  }, [getUserId])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content')
      return
    }

    setModalLoading(true)
    setError('')

    try {
      const userId = getUserId()
      
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          title: title.trim(),
          content: content.trim()
        })
        .select()

      if (error) throw error

      setNotes(prev => [data[0], ...prev])
      closeModal()
    } catch (error) {
      console.error('Error creating note:', error)
      setError('Failed to create note')
    } finally {
      setModalLoading(false)
    }
  }

  const handleUpdateNote = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content')
      return
    }

    setModalLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingNote.id)
        .select()

      if (error) throw error

      setNotes(prev => prev.map(note => 
        note.id === editingNote.id ? data[0] : note
      ))
      closeModal()
    } catch (error) {
      console.error('Error updating note:', error)
      setError('Failed to update note')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      setNotes(prev => prev.filter(note => note.id !== noteId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting note:', error)
      setError('Failed to delete note')
    }
  }

  const openModal = (note = null) => {
    setEditingNote(note)
    setTitle(note ? note.title : '')
    setContent(note ? note.content : '')
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingNote(null)
    setTitle('')
    setContent('')
    setError('')
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Filter notes based on search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes
    
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [notes, searchTerm])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const noteVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Back Button & Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quick Notes
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-black/20"
            >
              🌙
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 md:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Search and Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            {/* Search Bar */}
            <motion.div variants={itemVariants} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </motion.div>

            {/* Add Note Button */}
            <motion.button
              variants={itemVariants}
              onClick={() => openModal()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Note</span>
            </motion.button>
          </motion.div>

          {/* Notes Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredNotes.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {notes.length === 0 
                    ? 'Create your first note to get started!' 
                    : 'Try adjusting your search terms'
                  }
                </p>
                {notes.length === 0 && (
                  <button
                    onClick={() => openModal()}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create First Note</span>
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {filteredNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      variants={noteVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      className="glass-effect rounded-2xl p-6 border border-white/20 dark:border-white/10 backdrop-blur-xl group hover:shadow-lg transition-all duration-200"
                    >
                      {/* Note Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {note.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(note.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(note)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-black/20"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(note.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-black/20"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Note Content */}
                      <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        <p className="line-clamp-4">
                          {note.content}
                        </p>
                      </div>

                      {/* Note Footer */}
                      {note.updated_at !== note.created_at && (
                        <div className="mt-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Updated {formatDate(note.updated_at)}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Note Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass-effect rounded-3xl p-8 border border-white/20 dark:border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingNote ? 'Edit Note' : 'Create Note'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-black/20"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500 rounded-lg flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter note title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200 resize-none"
                    placeholder="Write your note content here..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={closeModal}
                  disabled={modalLoading}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingNote ? handleUpdateNote : handleCreateNote}
                  disabled={modalLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {modalLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <BookmarkIcon className="h-5 w-5" />
                      <span>{editingNote ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-effect rounded-3xl p-8 border border-white/20 dark:border-white/10 backdrop-blur-xl text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <TrashIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete Note
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteNote(deleteConfirm)}
                  className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotesPage 