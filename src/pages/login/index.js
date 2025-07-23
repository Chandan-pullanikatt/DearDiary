import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import LoginImg from '../../assets/login.png';

function Login() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

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
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-6xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div variants={itemVariants} className="text-center lg:text-left space-y-8">
            {/* Logo */}
            <div className="flex flex-col items-center justify-center space-y-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">DD</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-gradient">
                DearDiary
              </h1>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <motion.h2
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-gray-100 leading-tight"
              >
                Keep life{' '}
                <span className="text-gradient">simple</span>
              </motion.h2>
              
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg"
              >
                Organize your thoughts with simple notes or keep a private diary with mood tracking and calendar views.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoogleLogin}
                  className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21.99 10.79C21.99 10.29 21.95 9.79 21.86 9.29H12.21V13.29H17.8C17.56 14.79 16.57 16.09 15.04 17.09V19.69H18.33C20.43 17.89 21.99 15.09 21.99 11.79V10.79Z" fill="#4285F4" />
                    <path d="M12.21 22C14.91 22 17.21 21.04 18.96 19.49L15.67 17.24C14.77 17.89 13.57 18.24 12.21 18.24C9.61 18.24 7.41 16.54 6.51 14.24H3.12V16.54C4.87 19.89 8.29 22 12.21 22Z" fill="#34A853" />
                    <path d="M6.51 14.04C6.26 13.34 6.14 12.59 6.14 11.79C6.14 11.04 6.26 10.29 6.51 9.59V7.29H3.12C2.32 8.84 1.86 10.54 1.86 12.29C1.86 14.04 2.32 15.74 3.12 17.29L6.51 14.04Z" fill="#FBBC05" />
                    <path d="M12.21 5.54C13.61 5.54 14.81 6 15.61 6.75L18.41 3.95C16.71 2.35 14.61 1.54 12.21 1.54C8.29 1.54 4.87 3.65 3.12 6.99L6.51 9.24C7.41 6.99 9.61 5.54 12.21 5.54Z" fill="#EA4335" />
                  </svg>
                  <span>Login with Google</span>
                </motion.button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTheme}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-2 transition-colors mx-auto"
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span className="text-sm">{isDark ? 'Light' : 'Dark'} Mode</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Features */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8"
            >
              {[
                { icon: '📝', title: 'Simple', desc: 'Clean interface' },
                { icon: '🔍', title: 'Searchable', desc: 'Find anything fast' },
                { icon: '🎨', title: 'Beautiful', desc: 'Modern design' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="glass-card p-4 text-center"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            variants={imageVariants}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />
              
              {/* Main image container */}
              <motion.div
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ duration: 0.3 }}
                className="relative glass-card p-8 max-w-lg mx-auto"
              >
                <img
                  src={LoginImg}
                  alt="Note taking illustration"
                  className="w-full h-auto rounded-2xl"
                />
                
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full shadow-lg"
                />
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full shadow-lg"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;

