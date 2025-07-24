import React, { useState, useEffect } from "react";
import { Route, Routes } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import SupabaseSetupRequired from "../components/SupabaseSetupRequired";
import { Toaster } from 'react-hot-toast';

// Pages
import AuthPage from "../pages/auth";
import Dashboard from "../pages/dashboard";
import NotesPage from "../pages/notes/NotesPage";
import DiaryPage from "../pages/diary/DiaryPage";
import VerifyPin from "../pages/pin/VerifyPin";
import SetPin from "../pages/pin/SetPin";
import UpdatePasswordPage from "../pages/auth/UpdatePasswordPage";
import AuthLayout from "../pages/auth/AuthLayout";

function App() {
  const [supabaseConfigured, setSupabaseConfigured] = useState(null);

  useEffect(() => {
    // Check if Supabase is properly configured
    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || 
          supabaseUrl === 'YOUR_SUPABASE_URL' || 
          supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY' ||
          !supabaseUrl.startsWith('https://')) {
        setSupabaseConfigured(false);
      } else {
        // Try to import the supabase config to trigger validation
        import('../config/supabase').then(() => {
          setSupabaseConfigured(true);
        }).catch((error) => {
          console.error('Supabase configuration error:', error);
          setSupabaseConfigured(false);
        });
      }
    } catch (error) {
      console.error('Error checking Supabase configuration:', error);
      setSupabaseConfigured(false);
    }
  }, []);

  // Show loading while checking configuration
  if (supabaseConfigured === null) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Checking configuration...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show setup guide if Supabase is not configured
  if (!supabaseConfigured) {
    return (
      <ThemeProvider>
        <SupabaseSetupRequired />
      </ThemeProvider>
    );
  }

  // Render the full app if Supabase is configured
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen transition-all duration-300">
            <Toaster position="top-center" reverseOrder={false} />
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<AuthPage />} />
                <Route path="update-password" element={<UpdatePasswordPage />} />
              </Route>

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/notes" 
                element={
                  <ProtectedRoute>
                    <NotesPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/verify-pin" 
                element={
                  <ProtectedRoute>
                    <VerifyPin />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/set-pin" 
                element={
                  <ProtectedRoute>
                    <SetPin />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/diary" 
                element={
                  <ProtectedRoute>
                    <DiaryPage />
                  </ProtectedRoute>
                } 
              />

              {/* Default redirect */}
              <Route path="/" element={<AuthPage />} />
              
              {/* Catch all route - redirect to login */}
              <Route path="*" element={<AuthPage />} />
            </Routes>
          </div>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
  