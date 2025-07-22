import bcrypt from 'bcryptjs'
import { supabase } from '../config/supabase'

// PIN utility functions
export const pinUtils = {
  // Hash a PIN using bcrypt
  hashPin: async (pin) => {
    try {
      const saltRounds = 12
      const hashedPin = await bcrypt.hash(pin, saltRounds)
      return hashedPin
    } catch (error) {
      console.error('Error hashing PIN:', error)
      throw new Error('Failed to hash PIN')
    }
  },

  // Verify PIN against hashed PIN
  verifyPin: async (pin, hashedPin) => {
    try {
      const isMatch = await bcrypt.compare(pin, hashedPin)
      return isMatch
    } catch (error) {
      console.error('Error verifying PIN:', error)
      throw new Error('Failed to verify PIN')
    }
  },

  // Check if user has a PIN set
  hasPin: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_pins')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        // We don't want to throw an error if the user simply doesn't have a PIN
        // PostgREST errors can be checked here, but for now, we'll just log
        console.error('Error checking for PIN:', error.message)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error checking PIN:', error)
      return false
    }
  },

  // Set PIN for user
  setPin: async (userId, pin) => {
    try {
      // Validate PIN format (4 digits)
      if (!/^\d{4}$/.test(pin)) {
        throw new Error('PIN must be exactly 4 digits')
      }

      const hashedPin = await pinUtils.hashPin(pin)

      const { data, error } = await supabase
        .from('user_pins')
        .upsert({
          user_id: userId,
          hashed_pin: hashedPin,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()

      if (error) {
        console.error('Error setting PIN:', error)
        throw new Error('Failed to set PIN')
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error setting PIN:', error)
      throw error
    }
  },

  // Verify PIN for user
  verifyUserPin: async (userId, pin) => {
    try {
      // Validate PIN format
      if (!/^\d{4}$/.test(pin)) {
        return { success: false, error: 'PIN must be exactly 4 digits' }
      }

      const { data, error } = await supabase
        .from('user_pins')
        .select('hashed_pin')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching PIN:', error)
        return { success: false, error: 'An error occurred while fetching PIN data.' }
      }

      if (!data) {
        return { success: false, error: 'PIN not found for this user.' }
      }

      const isValid = await pinUtils.verifyPin(pin, data.hashed_pin)
      
      return { 
        success: isValid, 
        error: isValid ? null : 'Incorrect PIN' 
      }
    } catch (error) {
      console.error('Error verifying PIN:', error)
      return { success: false, error: 'Failed to verify PIN' }
    }
  },

  // Remove PIN for user
  removePin: async (userId) => {
    try {
      const { error } = await supabase
        .from('user_pins')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error removing PIN:', error)
        throw new Error('Failed to remove PIN')
      }

      return { success: true }
    } catch (error) {
      console.error('Error removing PIN:', error)
      throw error
    }
  },

  // Validate PIN format
  isValidPinFormat: (pin) => {
    return /^\d{4}$/.test(pin)
  }
}

export default pinUtils 