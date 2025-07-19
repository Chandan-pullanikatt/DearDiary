import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import PasswordLock from '../../components/diary/PasswordLock';
import DiaryCalendar from '../../components/diary/DiaryCalendar';
import DiaryEntry from '../../components/diary/DiaryEntry';
import diaryUtils from '../../utils/diary';

const DiaryPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar' or 'entry'
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authStatus = diaryUtils.getAuthStatus();
      setIsAuthenticated(authStatus);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentView('entry');
  };

  const handleNewEntry = (date) => {
    setSelectedDate(date);
    setCurrentView('entry');
  };

  const handleBackToCalendar = () => {
    setCurrentView('calendar');
    setSelectedDate(null);
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.05 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your diary...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <PasswordLock onUnlock={handleAuthentication} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {currentView === 'calendar' ? (
          <motion.div
            key="calendar"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <DiaryCalendar
              onDateSelect={handleDateSelect}
              onNewEntry={handleNewEntry}
              selectedDate={selectedDate}
            />
          </motion.div>
        ) : (
          <motion.div
            key="entry"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <DiaryEntry
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onGoBack={handleBackToCalendar}
              isNewEntry={!diaryUtils.getDiaryEntry(selectedDate)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </>
  );
};

export default DiaryPage; 