import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import diaryUtils from '../../utils/diary';
import toast from 'react-hot-toast';

const PasswordLock = ({ onUnlock, onSetupPassword }) => {
  const [password, setPassword] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Check if password is already set
    setIsSetupMode(!diaryUtils.hasPassword());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Add a small delay for better UX
    setTimeout(() => {
      if (isSetupMode) {
        handleSetupPassword();
      } else {
        handleUnlock();
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSetupPassword = () => {
    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    diaryUtils.setPassword(password);
    diaryUtils.setAuthStatus(true);
    toast.success('🔐 Password set successfully!');
    onSetupPassword && onSetupPassword();
    onUnlock();
  };

  const handleUnlock = () => {
    if (diaryUtils.checkPassword(password)) {
      diaryUtils.setAuthStatus(true);
      toast.success('🔓 Welcome to your diary!');
      onUnlock();
    } else {
      setAttempts(prev => prev + 1);
      setError('Incorrect password');
      setPassword('');
      
      if (attempts >= 2) {
        toast.error('Multiple failed attempts. Please try again later.');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  };

  const inputVariants = {
    error: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: 180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md"
      >
        <div className="glass-effect rounded-3xl p-8 border border-white/20 dark:border-white/10 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              variants={iconVariants}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
            >
              {isSetupMode ? (
                <KeyIcon className="w-10 h-10 text-white" />
              ) : (
                <LockClosedIcon className="w-10 h-10 text-white" />
              )}
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isSetupMode ? 'Secure Your Diary' : 'Enter Password'}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400">
              {isSetupMode 
                ? 'Create a password to protect your personal thoughts' 
                : 'Enter your password to access your diary'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <motion.div 
                variants={error ? inputVariants : {}}
                animate={error ? "error" : ""}
                className="relative"
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className={`w-full px-4 py-3 pr-12 bg-white/20 dark:bg-black/20 border ${
                    error 
                      ? 'border-red-300 dark:border-red-500' 
                      : 'border-white/30 dark:border-white/20'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200`}
                  placeholder={isSetupMode ? "Create password (min 4 chars)" : "Enter your password"}
                  autoFocus
                  required
                  minLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </motion.div>
            </div>

            {/* Confirm Password (Setup Mode Only) */}
            <AnimatePresence>
              {isSetupMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    className={`w-full px-4 py-3 bg-white/20 dark:bg-black/20 border ${
                      error 
                        ? 'border-red-300 dark:border-red-500' 
                        : 'border-white/30 dark:border-white/20'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200`}
                    placeholder="Confirm your password"
                    required={isSetupMode}
                    minLength={4}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || (!password.trim() || (isSetupMode && !confirmPassword.trim()))}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>{isSetupMode ? 'Secure Diary' : 'Unlock Diary'}</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          {!isSetupMode && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  const confirmed = window.confirm(
                    'This will remove your current password and all diary entries. Are you sure?'
                  );
                  if (confirmed) {
                    diaryUtils.removePassword();
                    localStorage.removeItem('diary-entries');
                    setIsSetupMode(true);
                    setPassword('');
                    setConfirmPassword('');
                    setError('');
                    setAttempts(0);
                    toast.success('Password removed. Please set a new password.');
                  }
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Forgot password? Reset diary
              </button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
        >
          🔒 Your diary is encrypted and stored locally on your device
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PasswordLock; 