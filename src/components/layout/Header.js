import React from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, SunIcon, MoonIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ searchTerm, onSearchChange, onAddNote }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full glass-effect border-b border-white/20 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <h1 className="text-xl font-display font-semibold text-gradient">
              Note.me
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 max-w-lg mx-8"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search your notes..."
                className="input-field pl-10 pr-4 py-2.5 w-full"
              />
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-3"
          >
            {/* Add Note Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddNote}
              className="btn-primary flex items-center space-x-2 px-4 py-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">New Note</span>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 glass-effect rounded-xl hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-300"
            >
              {isDark ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 