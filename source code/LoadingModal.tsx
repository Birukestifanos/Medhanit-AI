'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LoadingModalProps {
  visible: boolean;
  message?: string;
}

export default function LoadingModal({ visible, message = "Loading your data..." }: LoadingModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-xs w-full mx-4 text-center border border-sky-100"
          >
            {/* Logo & Pulse Animation */}
            <div className="flex flex-col items-center space-y-4 mb-5">
              <div className="relative">
                {/* Outer Ring */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-full border-4 border-sky-200 absolute -inset-1"
                />
                {/* Middle Ring */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.2 }}
                  className="w-12 h-12 rounded-full border-4 border-sky-300 absolute -inset-0.5 opacity-70"
                />
                {/* Inner Dot */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center relative z-10">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Brand Text */}
              <h3 className="text-lg font-semibold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                MedAnit
              </h3>
            </div>

            {/* Message */}
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              {message}
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-1.5 mt-5">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-1.5 h-1.5 bg-sky-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}