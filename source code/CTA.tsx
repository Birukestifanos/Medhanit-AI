'use client';

import { motion, AnimatePresence } from 'framer-motion';

const CTA = () => {
  return (
    <section className="w-full bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white py-28 px-6 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-cyan-300/20 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12 relative z-10">
        {/* Text Block */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="md:flex-1 text-center md:text-left space-y-6"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-extrabold leading-tight"
          >
            Start Your Diagnostic Journey
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-sky-100 max-w-xl leading-relaxed mx-auto md:mx-0"
          >
            Medanit is your clinical companion — intelligent, intuitive, and designed for care. 
            Join today and bring clarity to every symptom.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-sky-600 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform transition-all animate-pulse-soft"
            >
              🚀 Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/20 text-white border border-white/50 px-8 py-4 text-lg font-semibold rounded-full hover:bg-white/30 transition-all"
            >
              🔍 Explore Features
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="md:flex-1 flex justify-center"
        >
          <div className="relative w-64 h-64">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-cyan-200/40 rounded-full blur-xl scale-110"></div>
            
            {/* Main Orb */}
            <div className="relative w-full h-full bg-gradient-to-br from-white/30 to-sky-100 backdrop-blur-sm rounded-full border border-white/40 flex items-center justify-center shadow-2xl">
              {/* Inner Symbol */}
              <svg
                className="w-20 h-20 text-white drop-shadow-md"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default CTA;