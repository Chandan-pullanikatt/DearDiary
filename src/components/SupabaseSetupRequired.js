import React from 'react'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const SupabaseSetupRequired = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-effect rounded-3xl p-8 border border-white/20 dark:border-white/10 backdrop-blur-xl text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <ExclamationTriangleIcon className="w-10 h-10 text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Supabase Setup Required
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Please configure your Supabase credentials to continue
          </p>

          {/* Steps */}
          <div className="space-y-6 text-left">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Create Supabase Project
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">supabase.com</a> and create a new project
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Get Your Credentials
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  In your Supabase dashboard, go to <strong>Settings → API</strong> and copy:
                  <br />• Project URL
                  <br />• anon/public key
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Create Environment File
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Create a <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">.env</code> file in your project root:
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-600 dark:text-green-400"># .env</div>
                  <div className="text-gray-700 dark:text-gray-300">
                    REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co<br />
                    REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Setup Database
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Run the SQL commands from <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">SUPABASE_SETUP.md</code> in your Supabase SQL editor
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Restart Development Server
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Stop the server (Ctrl+C) and run <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm start</code> again
                </p>
              </div>
            </div>
          </div>

          {/* Help Links */}
          <div className="mt-8 pt-6 border-t border-gray-200/20 dark:border-gray-700/20">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📖 Need help? Check the <code>SUPABASE_SETUP.md</code> file for detailed instructions
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SupabaseSetupRequired 