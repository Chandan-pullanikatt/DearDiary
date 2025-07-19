import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';

const MoodTracker = ({ selectedMood, onMoodChange, showLabel = true, size = 'md' }) => {
  const [hoveredMood, setHoveredMood] = useState(null);

  const moods = [
    { 
      id: 1, 
      emoji: '😢', 
      name: 'Sad', 
      color: 'from-blue-400 to-blue-600',
      description: 'Feeling down or melancholy'
    },
    { 
      id: 2, 
      emoji: '😔', 
      name: 'Low', 
      color: 'from-gray-400 to-gray-600',
      description: 'Not quite sad, but low energy'
    },
    { 
      id: 3, 
      emoji: '😐', 
      name: 'Neutral', 
      color: 'from-yellow-400 to-yellow-600',
      description: 'Feeling okay, neither good nor bad'
    },
    { 
      id: 4, 
      emoji: '😊', 
      name: 'Good', 
      color: 'from-green-400 to-green-600',
      description: 'Feeling positive and content'
    },
    { 
      id: 5, 
      emoji: '😄', 
      name: 'Great', 
      color: 'from-purple-400 to-purple-600',
      description: 'Feeling amazing and energetic'
    }
  ];

  const sizeClasses = {
    sm: {
      container: 'space-y-2',
      emoji: 'text-2xl w-8 h-8',
      grid: 'grid-cols-5 gap-1',
      button: 'p-1'
    },
    md: {
      container: 'space-y-4',
      emoji: 'text-3xl w-12 h-12',
      grid: 'grid-cols-5 gap-2',
      button: 'p-2'
    },
    lg: {
      container: 'space-y-6',
      emoji: 'text-4xl w-16 h-16',
      grid: 'grid-cols-5 gap-3',
      button: 'p-3'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const moodVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300
      }
    },
    hover: {
      scale: 1.1,
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const getMoodById = (id) => moods.find(mood => mood.id === id);
  const displayMood = hoveredMood ? getMoodById(hoveredMood) : getMoodById(selectedMood);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${currentSize.container}`}
    >
      {showLabel && (
        <div className="flex items-center space-x-2 mb-3">
          <HeartIcon className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            How are you feeling?
          </h3>
        </div>
      )}

      {/* Mood Selection Grid */}
      <div className={`grid ${currentSize.grid}`}>
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            variants={moodVariants}
            whileHover="hover"
            whileTap="tap"
            animate={selectedMood === mood.id ? "selected" : "visible"}
            onClick={() => onMoodChange(mood.id)}
            onMouseEnter={() => setHoveredMood(mood.id)}
            onMouseLeave={() => setHoveredMood(null)}
            className={`
              ${currentSize.button} ${currentSize.emoji}
              relative flex items-center justify-center
              rounded-2xl transition-all duration-200
              ${selectedMood === mood.id 
                ? `bg-gradient-to-r ${mood.color} shadow-lg` 
                : 'bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30'
              }
              border border-white/30 dark:border-white/20
              backdrop-blur-sm
            `}
          >
            <span className={`${currentSize.emoji.split(' ')[0]} transition-transform duration-200`}>
              {mood.emoji}
            </span>
            
            {/* Glow effect for selected mood */}
            {selectedMood === mood.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`
                  absolute inset-0 rounded-2xl 
                  bg-gradient-to-r ${mood.color} 
                  opacity-20 blur-md -z-10
                `}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Mood Description */}
      <AnimatePresence mode="wait">
        {displayMood && (
          <motion.div
            key={displayMood.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div className="glass-effect rounded-2xl p-4 border border-white/20 dark:border-white/10">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <span className="text-2xl">{displayMood.emoji}</span>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {displayMood.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {displayMood.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Scale Indicator */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative"
        >
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(selectedMood / 5) * 100}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${getMoodById(selectedMood)?.color} rounded-full`}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Mood display component for read-only views
export const MoodDisplay = ({ mood, size = 'sm', showName = false }) => {
  const moods = [
    { id: 1, emoji: '😢', name: 'Sad', color: 'from-blue-400 to-blue-600' },
    { id: 2, emoji: '😔', name: 'Low', color: 'from-gray-400 to-gray-600' },
    { id: 3, emoji: '😐', name: 'Neutral', color: 'from-yellow-400 to-yellow-600' },
    { id: 4, emoji: '😊', name: 'Good', color: 'from-green-400 to-green-600' },
    { id: 5, emoji: '😄', name: 'Great', color: 'from-purple-400 to-purple-600' }
  ];

  const moodData = moods.find(m => m.id === mood);
  if (!moodData) return null;

  const sizeClasses = {
    xs: 'text-lg w-6 h-6',
    sm: 'text-xl w-8 h-8',
    md: 'text-2xl w-10 h-10',
    lg: 'text-3xl w-12 h-12'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2"
    >
      <div className={`
        ${sizeClasses[size]} 
        flex items-center justify-center
        rounded-xl bg-gradient-to-r ${moodData.color}
        shadow-md
      `}>
        <span className={sizeClasses[size].split(' ')[0]}>{moodData.emoji}</span>
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {moodData.name}
        </span>
      )}
    </motion.div>
  );
};

export default MoodTracker; 