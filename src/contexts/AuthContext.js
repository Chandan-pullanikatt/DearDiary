import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import getURL from '../utils/utils'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        setError(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getURL()
        }
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getURL()
        }
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      // Supabase handles the redirect, so loading state might not need to be reset here
      // setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setUser(null)
      setSession(null)
      
      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      setError(error.message)
      return { error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getURL()
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Error resetting password:', error)
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Update password
  const updatePassword = async (password) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.updateUser({
        password
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Error updating password:', error)
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!session
  }

  // Get current user ID
  const getUserId = () => {
    return user?.id || null
  }

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated,
    getUserId,
    setError,
    signInWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 