import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  DocumentTextIcon, 
  BookOpenIcon,
  ArrowRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const { toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
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
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Note.me
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-black/20"
            >
              <SparklesIcon className="h-5 w-5" />
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-white/20 dark:bg-black/20 rounded-full backdrop-blur-sm">
              <UserCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:block">
                {user?.email}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-black/20"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 md:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Welcome back!
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Choose how you'd like to organize your thoughts today. Create quick notes or write in your private diary.
            </motion.p>
          </motion.div>

          {/* Navigation Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-6 md:gap-8"
          >
            {/* Notes Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              onClick={() => navigate('/notes')}
              className="glass-effect rounded-3xl p-8 border border-white/20 dark:border-white/10 backdrop-blur-xl cursor-pointer group"
            >
              <div className="text-center">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DocumentTextIcon className="h-10 w-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Quick Notes
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Capture your ideas, thoughts, and reminders quickly. Organize with colors and search through all your notes.
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <span>• Rich text support</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <span>• Color organization</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <span>• Real-time search</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  <span>Start writing</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>

            {/* Diary Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              onClick={() => navigate('/verify-pin')}
              className="glass-effect rounded-3xl p-8 border border-white/20 dark:border-white/10 backdrop-blur-xl cursor-pointer group"
            >
              <div className="text-center">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpenIcon className="h-10 w-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Personal Diary
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Keep your private thoughts secure with PIN protection. Track your daily journey and reflect on your experiences.
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <span>• 🔐 PIN protected</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <span>• 📅 Daily entries</span>
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <span>• 🔒 Private & secure</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-center space-x-2 text-purple-600 dark:text-purple-400 font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  <span>Open diary</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer Stats */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-center mt-12 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="glass-effect rounded-xl p-4 border border-white/20 dark:border-white/10 backdrop-blur-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">∞</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Notes</div>
              </div>
              <div className="glass-effect rounded-xl p-4 border border-white/20 dark:border-white/10 backdrop-blur-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">🔒</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Secure</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your thoughts, organized and protected
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard 