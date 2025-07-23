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
  LockClosedIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../config/supabase'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'

const DiaryPage = () => {
  const [entries, setEntries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [mood, setMood] = useState('')

  // Modal form state
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const { getUserId, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    // Lock body scroll when modal is open
    const originalStyle = window.getComputedStyle(document.body).overflow
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = originalStyle
    }
    // Cleanup function to restore original style
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isModalOpen])

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
          content: content.trim(),
          mood: mood,
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
          updated_at: new Date().toISOString(),
          mood: mood,
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
    setMood(entry ? entry.mood : '')
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEntry(null)
    setContent('')
    setMood('')
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

  const moods = {
    happy: { emoji: '😊', color: '#4CAF50', name: 'Happy' },
    sad: { emoji: '😢', color: '#2196F3', name: 'Sad' },
    anxious: { emoji: '😟', color: '#FFC107', name: 'Anxious' },
    excited: { emoji: '🤩', color: '#FF5722', name: 'Excited' },
    calm: { emoji: '😌', color: '#00BCD4', name: 'Calm' },
  }

  const moodData = useMemo(() => {
    const moodCounts = entries.reduce((acc, entry) => {
      if (entry.mood) {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
      }
      return acc
    }, {})

    return Object.entries(moodCounts).map(([mood, count]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: count,
      color: moods[mood].color,
    }))
  }, [entries])

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
    <div className={`min-h-screen bg-gray-100 dark:bg-slate-900 transition-all duration-300`}>
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
              className="flex items-center space-x-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 focus-visible:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <LockClosedIcon className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Personal Diary
              </h1>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800"
            >
              🌙
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 focus-visible:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
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
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            {/* Search Bar */}
            <motion.div variants={itemVariants} className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="  Search diary entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 transition-colors duration-300"
                />
              </div>
            </motion.div>

            {/* Add Entry Button */}
            {/* Add Entry Button */}
<motion.button
  variants={itemVariants}
  onClick={() => openModal()}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className={`btn-new-entry ${isDark ? 'dark' : 'light'} min-w-max flex items-center gap-2`}
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
              className="rounded-xl p-4 text-center border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm transition-colors duration-300"
            >
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {entries.length}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">
                Total Entries
              </div>
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-4 text-center border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm transition-colors duration-300"
            >
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {new Date().toLocaleDateString('en-US', { month: 'long' })}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">
                Current Month
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-xl p-4 text-center border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm transition-colors duration-300 col-span-2 md:col-span-1"
            >
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                🔒
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">
                Private & Secure
              </div>
            </motion.div>
          </motion.div>

          {/* Mood Insights */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl p-6 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm transition-colors duration-300"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ChartPieIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Mood Insights
              </h3>
            </div>
            {moodData.length > 0 ? (
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moodData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-slate-400">
                <p>No mood data yet. Start logging your moods to see insights here!</p>
              </div>
            )}
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
                <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                  <BookOpenIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {entries.length === 0 ? 'Start your diary journey' : 'No matching entries'}
                </h3>
                <p className="text-gray-700 dark:text-slate-300 mb-6 leading-relaxed">
                  {entries.length === 0 
                    ? 'Write your first diary entry to capture your thoughts and memories.' 
                    : 'Try adjusting your search terms to find what you\'re looking for.'
                  }
                </p>
                {entries.length === 0 && (
                  <button
                    onClick={() => openModal()}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-md transition-colors duration-300"
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
                      className="rounded-2xl p-6 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 group hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-300"
                    >
                      {/* Entry Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                            <CalendarDaysIcon className="h-5 w-5" />
                            <span className="font-medium">
                              {formatDateShort(entry.created_at)}
                            </span>
                          </div>
                          <div className="text-gray-600 dark:text-slate-400 text-sm">
                            {getTimeOfDay(entry.created_at)}
                          </div>
                          {entry.mood && (
                            <div className="text-2xl">
                              {moods[entry.mood].emoji}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(entry)}
                            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 focus-visible:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(entry.id)}
                            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 focus-visible:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Entry Content */}
                      <div className="text-gray-800 dark:text-slate-300 leading-relaxed">
                        <p className="whitespace-pre-wrap">
                          {entry.content}
                        </p>
                      </div>

                      {/* Entry Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-200/20 dark:border-slate-700/50 flex items-center justify-between">
                        <p className="text-xs text-gray-600 dark:text-gray-200">
                          {formatDate(entry.created_at)}
                        </p>
                        {entry.updated_at !== entry.created_at && (
                          <p className="text-xs text-gray-600 dark:text-gray-200">
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
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeModal}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 max-h-[80vh] flex flex-col"
                style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff' }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {editingEntry ? 'Edit Your Entry' : 'New Diary Entry'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto">
                  {/* Date Display */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-slate-400">
                      <CalendarDaysIcon className="h-5 w-5" />
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
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

                  <div className="space-y-6">
                    {/* Mood Selector */}
                    <div>
                      <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        How are you feeling today?
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        {Object.entries(moods).map(([moodKey, { emoji, name }]) => (
                          <motion.button
                            key={moodKey}
                            onClick={() => setMood(moodKey)}
                            className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center space-x-2 border-2 ${
                              mood === moodKey
                                ? 'bg-indigo-600 border-indigo-600 text-white scale-105 shadow-lg'
                                : 'bg-gray-100 dark:bg-slate-800 border-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="text-xl">{emoji}</span>
                            <span className="text-sm font-medium">{name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Text Area */}
                    <div>
                      <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        What's on your mind?
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Write about your day, thoughts, feelings, or anything that comes to mind..."
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-slate-800 flex-shrink-0">
                  <button
                    onClick={closeModal}
                    disabled={modalLoading}
                    className="px-6 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={editingEntry ? handleUpdateEntry : handleCreateEntry}
                    disabled={modalLoading}
                    className="px-6 py-2 font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {modalLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>{editingEntry ? 'Update Entry' : 'Save Entry'}</span>
                    )}
                  </motion.button>

                </div>
              </motion.div>
            </div>
          </>
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
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-200 dark:border-slate-700 text-center"
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
                  className="px-6 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-300"
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