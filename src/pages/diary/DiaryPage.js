import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../config/supabase'

const DiaryPage = () => {
  const [entries, setEntries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Modal form state
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const { getUserId, signOut } = useAuth()
  const { toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Load diary entries from Supabase - wrapped in useCallback to fix dependency warning
  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      const userId = getUserId()
      
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('❌ Failed to load diary entries')
        throw error
      }
      
      setEntries(data || [])
    } catch (error) {
      console.error('Error loading diary entries:', error)
      setError('Failed to load diary entries')
      toast.error('❌ Failed to load diary entries')
    } finally {
      setIsLoading(false)
    }
  }, [getUserId])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const handleCreateEntry = async () => {
    if (!content.trim()) {
      setError('Please write something in your diary entry')
      return
    }

    setModalLoading(true)
    setError('')

    try {
      const userId = getUserId()
      
      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: userId,
          content: content.trim()
        })
        .select()

      if (error) {
        toast.error('❌ Failed to create diary entry')
        throw error
      }

      setEntries(prev => [data[0], ...prev])
      closeModal()
    } catch (error) {
      console.error('Error creating diary entry:', error)
      setError('Failed to create diary entry')
      toast.error('❌ Failed to create diary entry')
    } finally {
      setModalLoading(false)
    }
  }

  const handleUpdateEntry = async () => {
    if (!content.trim()) {
      setError('Please write something in your diary entry')
      return
    }

    setModalLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEntry.id)
        .select()

      if (error) {
        toast.error('❌ Failed to update diary entry')
        throw error
      }

      setEntries(prev => prev.map(entry => 
        entry.id === editingEntry.id ? data[0] : entry
      ))
      closeModal()
    } catch (error) {
      console.error('Error updating diary entry:', error)
      setError('Failed to update diary entry')
      toast.error('❌ Failed to update diary entry')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteEntry = async (entryId) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId)

      if (error) {
        toast.error('❌ Failed to delete diary entry')
        throw error
      }

      setEntries(prev => prev.filter(entry => entry.id !== entryId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting diary entry:', error)
      setError('Failed to delete diary entry')
      toast.error('❌ Failed to delete diary entry')
    }
  }

  const openModal = (entry = null) => {
    setEditingEntry(entry)
    setContent(entry ? entry.content : '')
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEntry(null)
    setContent('')
    setError('')
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Filter entries based on search term
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries
    
    return entries.filter(entry =>
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [entries, searchTerm])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeOfDay = (dateString) => {
    const hour = new Date(dateString).getHours()
    if (hour < 6) return '🌙 Late Night'
    if (hour < 12) return '🌅 Morning'
    if (hour < 17) return '☀️ Afternoon'
    if (hour < 21) return '🌆 Evening'
    return '🌙 Night'
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

  const entryVariants = {
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
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading your diary...</p>
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
              className="flex items-center space-x-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 focus-visible:outline-none focus:ring-2 focus:ring-purple-500 rounded-md"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <LockClosedIcon className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Personal Diary
              </h1>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60"
            >
              🌙
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 focus-visible:outline-none focus:ring-2 focus:ring-purple-500 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 md:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
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
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search diary entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-300 backdrop-blur-sm transition-colors duration-300"
                />
              </div>
            </motion.div>

            {/* Add Entry Button */}
            <motion.button
              variants={itemVariants}
              onClick={() => openModal()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-md transition-colors duration-300"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Entry</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
          >
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-4 text-center border border-gray-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl transition-colors duration-300"
            >
              <div className="text-2xl font-semibold text-gray-800 dark:text-white">
                {entries.length}
              </div>
              <div className="text-sm text-gray-700 dark:text-slate-100">
                Total Entries
              </div>
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-4 text-center border border-gray-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl transition-colors duration-300"
            >
              <div className="text-2xl font-semibold text-gray-800 dark:text-white">
                {new Date().toLocaleDateString('en-US', { month: 'short' })}
              </div>
              <div className="text-sm text-gray-700 dark:text-slate-100">
                Current Month
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-xl p-4 text-center border border-gray-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl transition-colors duration-300 col-span-2 md:col-span-1"
            >
              <div className="text-2xl font-semibold text-gray-800 dark:text-white">
                🔒
              </div>
              <div className="text-sm text-gray-700 dark:text-slate-100">
                Private & Secure
              </div>
            </motion.div>
          </motion.div>

          {/* Diary Entries */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredEntries.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center">
                  <BookOpenIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {entries.length === 0 ? 'Start your diary journey' : 'No matching entries'}
                </h3>
                <p className="text-gray-700 dark:text-slate-300 mb-6">
                  {entries.length === 0 
                    ? 'Write your first diary entry to capture your thoughts and memories.' 
                    : 'Try adjusting your search terms to find what you\'re looking for.'
                  }
                </p>
                {entries.length === 0 && (
                  <button
                    onClick={() => openModal()}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-md transition-colors duration-300"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Write First Entry</span>
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {filteredEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      variants={entryVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      className="rounded-2xl p-6 border border-gray-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl group hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-300"
                    >
                      {/* Entry Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                            <CalendarDaysIcon className="h-5 w-5" />
                            <span className="font-medium">
                              {formatDateShort(entry.created_at)}
                            </span>
                          </div>
                          <div className="text-gray-600 dark:text-slate-400 text-sm">
                            {getTimeOfDay(entry.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(entry)}
                            className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60 focus-visible:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(entry.id)}
                            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60 focus-visible:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Entry Content */}
                      <div className="text-gray-800 dark:text-slate-200 leading-relaxed">
                        <p className="whitespace-pre-wrap">
                          {entry.content}
                        </p>
                      </div>

                      {/* Entry Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/20 flex items-center justify-between">
                        <p className="text-xs text-gray-600 dark:text-slate-400">
                          {formatDate(entry.created_at)}
                        </p>
                        {entry.updated_at !== entry.created_at && (
                          <p className="text-xs text-gray-600 dark:text-slate-400">
                            Updated {formatDate(entry.updated_at)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Entry Modal */}
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
              className="w-full max-w-2xl bg-white/80 dark:bg-slate-900/80 rounded-3xl p-8 border border-gray-200 dark:border-slate-700/50 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingEntry ? 'Edit Entry' : 'New Diary Entry'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60 focus-visible:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-4">
                  <CalendarDaysIcon className="h-5 w-5" />
                  <span className="font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
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
                    What's on your mind today?
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-300 backdrop-blur-sm transition-colors duration-300 resize-none"
                    placeholder="Write about your day, thoughts, feelings, or anything that comes to mind..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={closeModal}
                  disabled={modalLoading}
                  className="px-6 py-3 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={editingEntry ? handleUpdateEntry : handleCreateEntry}
                  disabled={modalLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center space-x-2"
                >
                  {modalLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <BookOpenIcon className="h-5 w-5" />
                      <span>{editingEntry ? 'Update Entry' : 'Save Entry'}</span>
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
              className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 rounded-3xl p-8 border border-gray-200 dark:border-slate-700/50 backdrop-blur-xl text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <TrashIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Delete Entry
              </h3>
              
              <p className="text-gray-700 dark:text-slate-300 mb-6">
                Are you sure you want to delete this diary entry? This action cannot be undone.
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteEntry(deleteConfirm)}
                  className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors duration-300"
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

export default DiaryPage 