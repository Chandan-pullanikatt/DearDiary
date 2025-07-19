import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  ClockIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowLeftIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import MoodTracker from './MoodTracker';
import diaryUtils, { formatDisplayDate, formatTime } from '../../utils/diary';
import toast from 'react-hot-toast';

const DiaryEntry = ({ 
  selectedDate, 
  onDateChange, 
  onGoBack,
  isNewEntry = false 
}) => {
  const [entry, setEntry] = useState(null);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(isNewEntry);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  
  const contentRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Load entry for selected date
  useEffect(() => {
    const loadEntry = () => {
      const existingEntry = diaryUtils.getDiaryEntry(selectedDate);
      if (existingEntry) {
        setEntry(existingEntry);
        setContent(existingEntry.content || '');
        setMood(existingEntry.mood || null);
        setTitle(existingEntry.title || '');
        setIsEditing(false);
        setHasChanges(false);
      } else {
        // New entry
        setEntry(null);
        setContent('');
        setMood(null);
        setTitle('');
        setIsEditing(true);
        setHasChanges(false);
      }
    };

    loadEntry();
  }, [selectedDate]);

  // Calculate word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Auto-save functionality
  const saveEntry = useCallback(async (showToast = true) => {
    if (!content.trim() && !title.trim() && !mood) {
      return; // Don't save empty entries
    }

    setIsSaving(true);
    
    const entryData = {
      title: title || formatDisplayDate(selectedDate),
      content: content.trim(),
      mood: mood,
      wordCount: wordCount,
      createdAt: entry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const success = diaryUtils.saveDiaryEntry(selectedDate, entryData);
      
      if (success) {
        setEntry(entryData);
        setLastSaved(new Date());
        setHasChanges(false);
        
        if (showToast) {
          toast.success('✨ Entry saved!', {
            duration: 2000,
            position: 'bottom-center'
          });
        }
      } else {
        throw new Error('Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      if (showToast) {
        toast.error('Failed to save entry');
      }
    } finally {
      setIsSaving(false);
    }
  }, [content, title, mood, selectedDate, entry, wordCount]);

  // Auto-save with debounce
  useEffect(() => {
    if (hasChanges && (content.trim() || title.trim() || mood)) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveEntry(false); // Auto-save without toast
      }, 2000); // Save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasChanges, content, title, mood, saveEntry]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleMoodChange = (newMood) => {
    setMood(newMood);
    setHasChanges(true);
  };

  const handleManualSave = () => {
    saveEntry(true);
  };

  const handleDeleteEntry = () => {
    const confirmed = window.confirm('Are you sure you want to delete this entry? This action cannot be undone.');
    
    if (confirmed) {
      diaryUtils.deleteDiaryEntry(selectedDate);
      toast.success('Entry deleted');
      onGoBack();
    }
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (hasChanges) {
      const confirmChange = window.confirm('You have unsaved changes. Do you want to save them before changing the date?');
      if (confirmChange) {
        saveEntry(false);
      }
    }
    onDateChange(newDate);
  };

  const toggleEdit = () => {
    if (isEditing && hasChanges) {
      const confirmDiscard = window.confirm('You have unsaved changes. Do you want to save them?');
      if (confirmDiscard) {
        saveEntry(true);
      }
    }
    setIsEditing(!isEditing);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.header 
          variants={cardVariants}
          className="glass-effect rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Calendar</span>
            </motion.button>

            <div className="flex items-center space-x-4">
              {/* Save Status */}
              <AnimatePresence>
                {isSaving && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400"
                  >
                    <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </motion.div>
                )}
                
                {lastSaved && !isSaving && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Saved {formatTime(lastSaved)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {!isEditing && entry && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleEdit}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </motion.button>
                )}

                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleManualSave}
                    disabled={isSaving || (!content.trim() && !title.trim() && !mood)}
                    className="btn-primary text-sm"
                  >
                    Save
                  </motion.button>
                )}

                {entry && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteEntry}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              {isEditing ? (
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  className="bg-transparent text-lg font-semibold text-gray-900 dark:text-white border-none focus:outline-none"
                />
              ) : (
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDisplayDate(selectedDate)}
                </h1>
              )}
            </div>

            {/* Entry Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {wordCount > 0 && (
                <div className="flex items-center space-x-1">
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>{wordCount} words</span>
                </div>
              )}
              
              {entry?.createdAt && (
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Created {formatTime(new Date(entry.createdAt))}</span>
                </div>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Entry Content */}
          <motion.div 
            variants={cardVariants}
            className="lg:col-span-2"
          >
            <div className="glass-effect rounded-2xl p-6 border border-white/20 dark:border-white/10 h-fit">
              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entry Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder={formatDisplayDate(selectedDate)}
                    className="w-full px-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-lg font-semibold text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm"
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title || formatDisplayDate(selectedDate)}
                  </h2>
                )}
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Write your thoughts...
                </label>
                {isEditing ? (
                  <textarea
                    ref={contentRef}
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Dear diary, today was..."
                    className="w-full h-96 px-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm resize-none"
                    autoFocus
                  />
                ) : (
                  <div className="min-h-96 p-4 bg-white/10 dark:bg-black/10 rounded-xl">
                    {content ? (
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-gray-900 dark:text-white leading-relaxed">
                          {content}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <BookOpenIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No entry for this date yet.</p>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="mt-2 text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            Start writing
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Auto-save indicator */}
              {hasChanges && !isSaving && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-amber-600 dark:text-amber-400 flex items-center space-x-1"
                >
                  <ClockIcon className="w-4 h-4" />
                  <span>Auto-saving in a moment...</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            variants={cardVariants}
            className="space-y-6"
          >
            {/* Mood Tracker */}
            <div className="glass-effect rounded-2xl p-6 border border-white/20 dark:border-white/10">
              <MoodTracker
                selectedMood={mood}
                onMoodChange={isEditing ? handleMoodChange : () => {}}
                size="md"
                showLabel={true}
              />
            </div>

            {/* Entry History */}
            {entry && (
              <div className="glass-effect rounded-2xl p-6 border border-white/20 dark:border-white/10">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Entry Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(entry.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Words:</span>
                    <span className="text-gray-900 dark:text-white">{entry.wordCount || wordCount}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DiaryEntry; 