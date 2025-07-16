import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SwatchIcon } from '@heroicons/react/24/outline';

const NewNoteModal = ({ isOpen, onClose, onSave, editNote = null }) => {
  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState('rgba(251, 235, 149, 0.4)');

  const colorOptions = [
    { value: 'rgba(251, 235, 149, 0.4)', name: 'Sunny Yellow', gradient: 'from-yellow-200 to-yellow-300' },
    { value: 'rgba(182, 165, 203, 0.4)', name: 'Lavender Purple', gradient: 'from-purple-200 to-purple-300' },
    { value: 'rgba(253, 186, 163, 0.4)', name: 'Peach Orange', gradient: 'from-orange-200 to-orange-300' },
    { value: 'rgba(151, 210, 188, 0.4)', name: 'Mint Green', gradient: 'from-green-200 to-green-300' },
    { value: 'rgba(173, 216, 230, 0.4)', name: 'Sky Blue', gradient: 'from-blue-200 to-blue-300' },
    { value: 'rgba(255, 182, 193, 0.4)', name: 'Rose Pink', gradient: 'from-pink-200 to-pink-300' },
  ];

  useEffect(() => {
    if (editNote) {
      setText(editNote.text);
      setSelectedColor(editNote.color);
    } else {
      setText('');
      setSelectedColor('rgba(251, 235, 149, 0.4)');
    }
  }, [editNote, isOpen]);

  const handleSave = () => {
    if (!text.trim()) return;

    const noteData = {
      id: editNote ? editNote.id : Date.now(),
      text: text.trim(),
      color: selectedColor,
      createdAt: editNote ? editNote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(noteData);
    handleClose();
  };

  const handleClose = () => {
    setText('');
    setSelectedColor('rgba(251, 235, 149, 0.4)');
    onClose();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.75,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.75,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-effect rounded-3xl shadow-2xl border border-white/20 dark:border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-white/10">
              <div>
                <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-gray-100">
                  {editNote ? 'Edit Note' : 'Create New Note'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {editNote ? 'Update your thoughts' : 'Capture your ideas and thoughts'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-2 glass-effect rounded-xl hover:bg-red-500/20 transition-all duration-200"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Your Note
                </label>
                <motion.textarea
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start typing your note here..."
                  rows={8}
                  className="input-field resize-none text-base leading-relaxed"
                  autoFocus
                />
              </div>

              {/* Color Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <SwatchIcon className="h-5 w-5 inline mr-2" />
                  Choose Color Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {colorOptions.map((color, index) => (
                    <motion.button
                      key={color.value}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedColor(color.value)}
                      className={`relative h-12 w-full rounded-xl bg-gradient-to-r ${color.gradient} 
                        border-2 transition-all duration-200 ${
                        selectedColor === color.value 
                          ? 'border-blue-500 shadow-lg shadow-blue-500/25' 
                          : 'border-white/30 hover:border-white/50'
                      }`}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Character Count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-right"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {text.length} characters
                </span>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-end space-x-4 p-6 border-t border-white/20 dark:border-white/10"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="btn-secondary px-6 py-2.5"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={!text.trim()}
                className={`btn-primary px-6 py-2.5 ${
                  !text.trim() 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
              >
                {editNote ? 'Update Note' : 'Save Note'}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewNoteModal; 