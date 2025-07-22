import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  KeyIcon, 
  LockClosedIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { pinUtils } from '../../utils/pin'

const SetPin = () => {
  const [step, setStep] = useState(1) // 1: set PIN, 2: confirm PIN
  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { getUserId } = useAuth()
  const navigate = useNavigate()
  
  const pinInputRefs = [useRef(), useRef(), useRef(), useRef()]
  const confirmInputRefs = [useRef(), useRef(), useRef(), useRef()]

  const handlePinChange = (index, value, isConfirm = false) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const currentPin = isConfirm ? confirmPin : pin;
    const setCurrentPin = isConfirm ? setConfirmPin : setPin;
    const refs = isConfirm ? confirmInputRefs : pinInputRefs;

    const newPin = [...currentPin];
    newPin[index] = value;

    setCurrentPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }

    // Auto-proceed to confirmation when all 4 digits are entered for the first time
    if (!isConfirm && newPin.every(d => d !== '')) {
      setTimeout(() => {
        setStep(2);
        confirmInputRefs[0].current?.focus();
      }, 300);
    }
  };

  const handleKeyDown = (index, e, isConfirm = false) => {
    const currentPin = isConfirm ? confirmPin : pin
    const refs = isConfirm ? confirmInputRefs : pinInputRefs

    if (e.key === 'Backspace' && !currentPin[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      refs[index - 1].current?.focus()
    } else if (e.key === 'Enter') {
      if (step === 1 && !isConfirm) {
        handleContinue()
      } else if (step === 2) {
        handleSubmit()
      }
    }
  }

  const handleContinue = () => {
    if (pin.join('').length !== 4) {
      setError('Please enter all 4 digits')
      return
    }

    setStep(2)
    setTimeout(() => {
      confirmInputRefs[0].current?.focus()
    }, 100)
  }

  const handleBack = () => {
    setStep(1)
    setConfirmPin(['', '', '', ''])
    setError('')
    setTimeout(() => {
      pinInputRefs[0].current?.focus()
    }, 100)
  }

  const handleSubmit = async () => {
    const pinValue = pin.join('')
    const confirmPinValue = confirmPin.join('')

    if (pinValue.length !== 4 || confirmPinValue.length !== 4) {
      setError('Please enter all 4 digits')
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
      
      // Show success and navigate to diary
      setTimeout(() => {
        navigate('/diary')
      }, 1000)
    } catch (error) {
      console.error('Error setting PIN:', error)
      setError(error.message || 'Failed to set PIN. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    if (step === 1) {
      setPin(['', '', '', ''])
      pinInputRefs[0].current?.focus()
    } else {
      setConfirmPin(['', '', '', ''])
      confirmInputRefs[0].current?.focus()
    }
    setError('')
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

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.3 }
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* Progress Indicator */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center space-x-4 mb-8"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
          }`}>
            {step > 1 ? <CheckCircleIcon className="h-5 w-5" /> : '1'}
          </div>
          <div className={`w-16 h-1 rounded ${
            step >= 2 ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
          }`}>
            2
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={itemVariants}
          className="glass-effect rounded-3xl p-8 border border-white/20 dark:border-white/10 backdrop-blur-xl"
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <KeyIcon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Set Your PIN
                  </h1>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    Create a 4-digit PIN to secure your diary
                  </p>
                </div>

                {/* PIN Input */}
                <motion.div
                  variants={pinInputVariants}
                  animate={error ? "error" : "visible"}
                  className="flex justify-center space-x-4 mb-6"
                >
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={pinInputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-14 h-14 text-center text-2xl font-bold bg-white/20 dark:bg-black/20 border ${
                        error 
                          ? 'border-red-300 dark:border-red-500' 
                          : 'border-white/30 dark:border-white/20'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200`}
                      disabled={isLoading}
                    />
                  ))}
                </motion.div>

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  disabled={pin.join('').length !== 4}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Confirm Your PIN
                  </h1>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your PIN again to confirm
                  </p>
                </div>

                {/* Confirm PIN Input */}
                <motion.div
                  variants={pinInputVariants}
                  animate={error ? "error" : "visible"}
                  className="flex justify-center space-x-4 mb-6"
                >
                  {confirmPin.map((digit, index) => (
                    <input
                      key={index}
                      ref={confirmInputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, true)}
                      onKeyDown={(e) => handleKeyDown(index, e, true)}
                      className={`w-14 h-14 text-center text-2xl font-bold bg-white/20 dark:bg-black/20 border ${
                        error 
                          ? 'border-red-300 dark:border-red-500' 
                          : 'border-white/30 dark:border-white/20'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200`}
                      disabled={isLoading}
                    />
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || confirmPin.join('').length !== 4}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LockClosedIcon className="h-5 w-5" />
                        <span>Set PIN</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBack}
                    disabled={isLoading}
                    className="w-full py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500 rounded-lg flex items-center space-x-2"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Security Note */}
          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            🔒 Your PIN will be encrypted and stored securely
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SetPin 