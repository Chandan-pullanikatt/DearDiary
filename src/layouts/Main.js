import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

function Main() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="loading-dots text-blue-500 mb-4">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
            </motion.div>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </motion.main>
  );
}

export default Main;
