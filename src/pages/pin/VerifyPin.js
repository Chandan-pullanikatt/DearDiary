import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  LockClosedIcon, 
  KeyIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { pinUtils } from '../../utils/pin'
import { useTheme } from '../../contexts/ThemeContext'

const VerifyPin = () => {
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [checkingPin, setCheckingPin] = useState(true)
  
  const { getUserId } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const inputRefs = [useRef(), useRef(), useRef(), useRef()]

  // Check if user has a PIN set
  useEffect(() => {
    const checkUserPin = async () => {
      try {
        const userId = getUserId()
        if (!userId) {
          navigate('/login')
          return
        }

        const userHasPin = await pinUtils.hasPin(userId)
        
        if (!userHasPin) {
          navigate('/set-pin')
          return
        }
      } catch (error) {
        console.error('Error checking PIN:', error)
        setError('Failed to check PIN status')
      } finally {
        setCheckingPin(false)
      }
    }

    checkUserPin()
  }, [getUserId, navigate])

  const handlePinChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value

    setPin(newPin)
    setError('')

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto-submit when all 4 digits are entered
    if (newPin.every(digit => digit !== '') && index === 3) {
      handleSubmit(newPin.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs[index - 1].current?.focus()
    } else if (e.key === 'Enter') {
      handleSubmit(pin.join(''))
    }
  }

  const handleSubmit = async (pinValue = pin.join('')) => {
    if (pinValue.length !== 4) {
      setError('Please enter all 4 digits')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const userId = getUserId()
      const result = await pinUtils.verifyUserPin(userId, pinValue)

      if (result.success) {
        // PIN verified successfully
        navigate('/diary')
      } else {
        setError(result.error || 'Incorrect PIN')
        setAttempts(prev => prev + 1)
        setPin(['', '', '', ''])
        inputRefs[0].current?.focus()

        if (attempts >= 4) {
          setError('Too many attempts. Please try again later.')
          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
        }
      }
    } catch (error) {
      console.error('PIN verification error:', error)
      setError('Failed to verify PIN. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPin(['', '', '', ''])
    setError('')
    inputRefs[0].current?.focus()
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const pinInputVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    error: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  }

  if (checkingPin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Checking PIN status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm"
      >
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          {/* Back Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </motion.button>

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-black/20"
          >
            <SparklesIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Main Card */}
        <motion.div
          variants={itemVariants}
          className="glass-effect rounded-3xl p-8 border border-white/20 dark:border-white/10 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              variants={itemVariants}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
            >
              <LockClosedIcon className={`w-8 h-8 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Enter Your PIN
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 dark:text-gray-400"
            >
              Enter your 4-digit PIN to access your diary
            </motion.p>
          </div>

          {/* PIN Input */}
          <motion.div
            variants={pinInputVariants}
            animate={error ? "error" : "visible"}
            className="flex justify-center space-x-3 mb-6"
          >
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-12 text-center text-2xl font-bold bg-white/20 dark:bg-black/20 border ${
                  error 
                    ? 'border-red-300 dark:border-red-500' 
                    : isDark ? 'border-white/30' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200`}
                disabled={isLoading}
              />
            ))}
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500 rounded-lg flex items-center space-x-2"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attempts Counter */}
          {attempts > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-6"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Attempts: {attempts}/5
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              variants={itemVariants}
              onClick={() => handleSubmit()}
              disabled={isLoading || pin.join('').length !== 4}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 ${
                isDark
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyIcon className="h-5 w-5" />
                  <span>Verify PIN</span>
                </>
              )}
            </motion.button>

            <motion.button
              variants={itemVariants}
              onClick={handleClear}
              disabled={isLoading}
              className="w-full py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear
            </motion.button>
          </div>

          {/* Security Note */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
          >
            🔒 Your PIN is encrypted and secure
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default VerifyPin 