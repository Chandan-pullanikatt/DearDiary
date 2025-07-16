import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/formatdate';

const NoteCard = ({ note, onDelete, onEdit, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const contentVariants = {
    collapsed: { height: "auto" },
    expanded: { height: "auto" }
  };

  const getGradientColors = (color) => {
    const colorMap = {
      'rgba(251, 235, 149, 0.4)': 'from-yellow-200/30 to-yellow-300/20',
      'rgba(182, 165, 203, 0.4)': 'from-purple-200/30 to-purple-300/20',
      'rgba(253, 186, 163, 0.4)': 'from-orange-200/30 to-orange-300/20',
      'rgba(151, 210, 188, 0.4)': 'from-green-200/30 to-green-300/20',
    };
    return colorMap[color] || 'from-blue-200/30 to-blue-300/20';
  };

  const truncatedText = note.text.length > 150 ? note.text.substring(0, 150) + '...' : note.text;
  const showReadMore = note.text.length > 150;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300
        bg-gradient-to-br ${getGradientColors(note.color)} 
        glass-effect border border-white/30 dark:border-white/20
        hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
      
      {/* Action buttons */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 flex space-x-2 z-10"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm rounded-lg transition-all duration-200"
            >
              <PencilIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-lg transition-all duration-200"
            >
              <TrashIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          variants={contentVariants}
          animate={isExpanded ? "expanded" : "collapsed"}
          className="space-y-4"
        >
          <div className="min-h-[120px]">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base font-medium">
              {isExpanded ? note.text : truncatedText}
            </p>
          </div>

          {showReadMore && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </motion.button>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0.7 }}
          whileHover={{ opacity: 1 }}
          className="mt-4 pt-4 border-t border-white/20 dark:border-white/10"
        >
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4" />
            <span className="text-xs font-medium">
              {formatDate(note.createdAt)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Floating orbs for decoration */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-xl" />
    </motion.div>
  );
};

export default NoteCard; 