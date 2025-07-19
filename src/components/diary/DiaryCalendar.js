import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import { 
  CalendarDaysIcon, 
  PlusIcon, 
  BookOpenIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import diaryUtils, { formatDisplayDate, formatDateKey } from '../../utils/diary';
import { MoodDisplay } from './MoodTracker';
import toast from 'react-hot-toast';
import 'react-calendar/dist/Calendar.css';

const DiaryCalendar = ({ onDateSelect, onNewEntry, selectedDate }) => {
  const [entries, setEntries] = useState({});
  const [showMoodStats, setShowMoodStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntries, setFilteredEntries] = useState([]);

  // Load all entries
  useEffect(() => {
    const loadEntries = () => {
      const allEntries = diaryUtils.getAllEntries();
      setEntries(allEntries);
    };

    loadEntries();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim()) {
      const results = diaryUtils.searchEntries(searchTerm);
      setFilteredEntries(results);
    } else {
      setFilteredEntries([]);
    }
  }, [searchTerm]);

  const handleDateClick = (date) => {
    const dateKey = formatDateKey(date);
    const entry = entries[dateKey];
    
    if (entry) {
      onDateSelect(date);
    } else {
      // Ask user if they want to create a new entry
      toast((t) => (
        <div className="flex items-center space-x-3">
          <div>
            <p className="font-medium">No entry for {date.toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Would you like to create one?</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onNewEntry(date);
              }}
              className="btn-primary text-sm py-1 px-3"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="btn-secondary text-sm py-1 px-3"
            >
              No
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'bottom-center'
      });
    }
  };

  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateKey = formatDateKey(date);
    const entry = entries[dateKey];
    
    if (!entry) return null;

    return (
      <div className="calendar-tile-content">
        {entry.mood && (
          <div className="flex justify-center mt-1">
            <MoodDisplay mood={entry.mood} size="xs" />
          </div>
        )}
        <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1 opacity-60"></div>
      </div>
    );
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const dateKey = formatDateKey(date);
    const hasEntry = entries[dateKey];
    const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey;
    const isToday = formatDateKey(new Date()) === dateKey;
    
    let className = 'calendar-tile';
    
    if (hasEntry) className += ' has-entry';
    if (isSelected) className += ' selected';
    if (isToday) className += ' today';
    
    return className;
  };

  const getMoodStats = () => {
    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalEntries = 0;

    Object.values(entries).forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood]++;
        totalEntries++;
      }
    });

    return { moodCounts, totalEntries };
  };

  const recentEntries = Object.entries(entries)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .slice(0, 5)
    .map(([date, entry]) => ({ date, ...entry }));

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header 
          variants={cardVariants}
          className="glass-effect rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Personal Diary
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your thoughts, captured in time
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMoodStats(!showMoodStats)}
                className="btn-secondary flex items-center space-x-2"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Mood Stats</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNewEntry(new Date())}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>New Entry</span>
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your diary entries..."
              className="w-full pl-10 pr-4 py-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm"
            />
          </div>
        </motion.header>

        {/* Search Results */}
        <AnimatePresence>
          {searchTerm && filteredEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-effect rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/10"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Search Results ({filteredEntries.length})
              </h3>
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <motion.div
                    key={entry.date}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onDateSelect(new Date(entry.date))}
                    className="p-4 bg-white/10 dark:bg-black/10 rounded-xl cursor-pointer hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {entry.title || formatDisplayDate(new Date(entry.date))}
                      </h4>
                      {entry.mood && <MoodDisplay mood={entry.mood} size="sm" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {entry.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood Statistics */}
        <AnimatePresence>
          {showMoodStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-effect rounded-2xl p-6 mb-6 border border-white/20 dark:border-white/10"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mood Statistics
              </h3>
              {(() => {
                const { moodCounts, totalEntries } = getMoodStats();
                const moods = [
                  { id: 1, emoji: '😢', name: 'Sad', color: 'bg-blue-500' },
                  { id: 2, emoji: '😔', name: 'Low', color: 'bg-gray-500' },
                  { id: 3, emoji: '😐', name: 'Neutral', color: 'bg-yellow-500' },
                  { id: 4, emoji: '😊', name: 'Good', color: 'bg-green-500' },
                  { id: 5, emoji: '😄', name: 'Great', color: 'bg-purple-500' }
                ];

                return (
                  <div className="grid grid-cols-5 gap-4">
                    {moods.map(mood => {
                      const count = moodCounts[mood.id];
                      const percentage = totalEntries > 0 ? (count / totalEntries * 100) : 0;
                      
                      return (
                        <div key={mood.id} className="text-center">
                          <div className="text-2xl mb-2">{mood.emoji}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {count}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {percentage.toFixed(0)}%
                          </div>
                          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${mood.color} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div 
            variants={cardVariants}
            className="lg:col-span-2"
          >
            <div className="glass-effect rounded-2xl p-6 border border-white/20 dark:border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <CalendarDaysIcon className="w-6 h-6" />
                  <span>Diary Calendar</span>
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {Object.keys(entries).length} entries
                </div>
              </div>

              <div className="diary-calendar">
                <Calendar
                  value={selectedDate || new Date()}
                  onClickDay={handleDateClick}
                  tileContent={getTileContent}
                  tileClassName={getTileClassName}
                  showNeighboringMonth={false}
                  prev2Label={null}
                  next2Label={null}
                  prevLabel={<ArrowLeftIcon className="w-4 h-4" />}
                  nextLabel={<ArrowRightIcon className="w-4 h-4" />}
                />
              </div>

              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full opacity-60"></div>
                  <span>Has entry</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Selected</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            variants={cardVariants}
            className="space-y-6"
          >
            {/* Recent Entries */}
            <div className="glass-effect rounded-2xl p-6 border border-white/20 dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Entries
              </h3>
              
              {recentEntries.length > 0 ? (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <motion.div
                      key={entry.date}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onDateSelect(new Date(entry.date))}
                      className="p-3 bg-white/10 dark:bg-black/10 rounded-xl cursor-pointer hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                        {entry.mood && <MoodDisplay mood={entry.mood} size="xs" />}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {entry.content || entry.title}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpenIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No entries yet</p>
                  <button
                    onClick={() => onNewEntry(new Date())}
                    className="mt-2 text-blue-500 hover:text-blue-600 transition-colors text-sm"
                  >
                    Write your first entry
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="glass-effect rounded-2xl p-6 border border-white/20 dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total entries:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Object.keys(entries).length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">This month:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Object.keys(entries).filter(date => {
                      const entryDate = new Date(date);
                      const now = new Date();
                      return entryDate.getMonth() === now.getMonth() && 
                             entryDate.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Streak:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(() => {
                      const today = new Date();
                      let streak = 0;
                      let currentDate = new Date(today);
                      
                      while (entries[formatDateKey(currentDate)]) {
                        streak++;
                        currentDate.setDate(currentDate.getDate() - 1);
                      }
                      
                      return streak;
                    })()} days
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Calendar Styles */}
      <style jsx>{`
        .diary-calendar .react-calendar {
          width: 100%;
          background: transparent;
          border: none;
          font-family: inherit;
        }
        
        .diary-calendar .react-calendar__navigation {
          display: flex;
          margin-bottom: 1rem;
        }
        
        .diary-calendar .react-calendar__navigation button {
          min-width: 44px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          color: inherit;
          font-size: 16px;
          font-weight: 600;
          padding: 0.5rem;
          margin: 0 0.25rem;
          transition: all 0.2s;
        }
        
        .diary-calendar .react-calendar__navigation button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }
        
        .diary-calendar .react-calendar__month-view__weekdays {
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: rgb(107, 114, 128);
        }
        
        .diary-calendar .react-calendar__tile {
          max-width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          color: inherit;
          padding: 0.75rem 0.5rem;
          margin: 0.125rem;
          transition: all 0.2s;
          position: relative;
          min-height: 60px;
        }
        
        .diary-calendar .react-calendar__tile:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.05);
        }
        
        .diary-calendar .react-calendar__tile.has-entry {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        .diary-calendar .react-calendar__tile.today {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          font-weight: 600;
        }
        
        .diary-calendar .react-calendar__tile.selected {
          background: rgba(147, 51, 234, 0.2);
          border-color: rgba(147, 51, 234, 0.4);
          font-weight: 600;
        }
        
        .calendar-tile-content {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </motion.div>
  );
};

export default DiaryCalendar; 