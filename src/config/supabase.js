import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseUrl === 'https://your-project-ref.supabase.co' || !supabaseUrl.startsWith('https://')) {
  console.error('❌ SUPABASE SETUP REQUIRED ❌')
  console.error('Your .env file contains placeholder values instead of real Supabase credentials.')
  console.error('')
  console.error('Please:')
  console.error('1. Go to https://supabase.com and create a new project')
  console.error('2. Get your credentials from Settings > API')
  console.error('3. Update your .env file with:')
  console.error('   REACT_APP_SUPABASE_URL=https://your-actual-project-ref.supabase.co')
  console.error('   REACT_APP_SUPABASE_ANON_KEY=your-actual-anon-key')
  console.error('')
  console.error('📖 See SUPABASE_SETUP.md for complete setup instructions')
  
  throw new Error('Supabase configuration contains placeholder values. Please update your .env file with real credentials.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY' || supabaseAnonKey === 'your-anon-key-here') {
  console.error('❌ SUPABASE_ANON_KEY contains placeholder value')
  console.error('Please set REACT_APP_SUPABASE_ANON_KEY in your .env file with your actual anon key from Supabase')
  
  throw new Error('Supabase anon key contains placeholder value. Please update your .env file.')
}

// Additional validation for URL format
if (!supabaseUrl.includes('.supabase.co')) {
  console.error('❌ Invalid Supabase URL format')
  console.error('Your URL should look like: https://your-project-ref.supabase.co')
  console.error('Current value:', supabaseUrl)
  
  throw new Error('Invalid Supabase URL format. Please check your project URL.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

// Log successful connection (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Supabase client initialized successfully')
  console.log('🔗 Connected to:', supabaseUrl)
}

export default supabase 