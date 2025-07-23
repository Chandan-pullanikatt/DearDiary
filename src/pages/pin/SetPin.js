import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  KeyIcon, 
  LockClosedIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { pinUtils } from '../../utils/pin'

const SetPin = () => {
  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { getUserId } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  const pinInputRefs = [useRef(), useRef(), useRef(), useRef()]
  const confirmInputRefs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    pinInputRefs[0].current?.focus()
  }, [])

  const handlePinChange = (index, value, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return

    const currentPin = isConfirm ? confirmPin : pin
    const setCurrentPin = isConfirm ? setConfirmPin : setPin
    const refs = isConfirm ? confirmInputRefs : pinInputRefs

    const newPin = [...currentPin]
    newPin[index] = value

    setCurrentPin(newPin)
    setError('')

    if (value && index < 3) {
      refs[index + 1].current?.focus()
    }
    
    if (newPin.every(d => d !== '') && !isConfirm) {
      confirmInputRefs[0].current?.focus()
    }
  }

  const handleKeyDown = (index, e, isConfirm = false) => {
    const currentPin = isConfirm ? confirmPin : pin
    const refs = isConfirm ? confirmInputRefs : pinInputRefs

    if (e.key === 'Backspace' && !currentPin[index] && index > 0) {
      refs[index - 1].current?.focus()
    } else if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    const pinValue = pin.join('')
    const confirmPinValue = confirmPin.join('')

    if (pinValue.length !== 4) {
      setError('Please set a 4-digit PIN.')
      pinInputRefs[0].current?.focus()
      return
    }

    if (confirmPinValue.length !== 4) {
      setError('Please confirm your 4-digit PIN.')
      confirmInputRefs[0].current?.focus()
      return
    }

    if (pinValue !== confirmPinValue) {
      setError('PINs do not match. Please try again.')
      setConfirmPin(['', '', '', ''])
      confirmInputRefs[0].current?.focus()
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const userId = getUserId()
      await pinUtils.setPin(userId, pinValue)
      
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/diary')
      }, 1500)
    } catch (error) {
      console.error('Error setting PIN:', error)
      setError(error.message || 'Failed to set PIN. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPin(['', '', '', ''])
    setConfirmPin(['', '', '', ''])
    setError('')
    pinInputRefs[0].current?.focus()
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
  
  const renderPinInputs = (p, refs, isConfirm) => (
    <motion.div
      variants={pinInputVariants}
      animate={error && (isConfirm || pin.join('').length === 4) ? "error" : "visible"}
      className="flex justify-center space-x-3"
    >
      {p.map((digit, index) => (
        <input
          key={index}
          ref={refs[index]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinChange(index, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
          className={`w-12 h-12 text-center text-2xl font-bold bg-white/20 dark:bg-black/20 border ${
            error && (isConfirm || pin.join('').length === 4)
              ? 'border-red-300 dark:border-red-500' 
              : isDark ? 'border-white/30' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200`}
          disabled={isLoading || isSuccess}
        />
      ))}
    </motion.div>
  )

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
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                isSuccess 
                ? 'bg-gradient-to-r from-green-500 to-blue-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
            >
              {isSuccess ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </motion.div>
              ) : (
                <KeyIcon className={`w-8 h-8 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              )}
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
            >
              {isSuccess ? 'PIN Set Successfully!' : 'Set Your Security PIN'}
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 dark:text-gray-400"
            >
              {isSuccess ? 'You can now access your diary.' : 'Create a 4-digit PIN to secure your diary.'}
            </motion.p>
          </div>

          {!isSuccess && (
            <>
              {/* PIN Input */}
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                    Enter PIN
                  </label>
                  {renderPinInputs(pin, pinInputRefs, false)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                    Confirm PIN
                  </label>
                  {renderPinInputs(confirmPin, confirmInputRefs, true)}
                </div>
              </div>

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

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  variants={itemVariants}
                  onClick={handleSubmit}
                  disabled={isLoading || pin.join('').length !== 4 || confirmPin.join('').length !== 4}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 ${
                    isDark
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <LockClosedIcon className="h-5 w-5" />
                      <span>Set PIN</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  onClick={handleClear}
                  disabled={isLoading}
                  className="w-full py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                >
                  Clear
                </motion.button>
              </div>
            </>
          )}

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

export default SetPin 