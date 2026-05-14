'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const { user, fetchUserData } = useAuth();

  // Fetch user data on mount
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    
    if (!user) {
      fetchUserData().catch((err) => {
        console.error('🔐 Fetch user data error:', err.message);
        setRole(null);
      });
    }

    return () => clearTimeout(timer);
  }, [fetchUserData]);

  // Sync role with user context
  useEffect(() => {
    setRole(user?.role || null);
  }, [user]);

  return (
    <section
      className="w-full min-h-[85vh] bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-6 text-center relative"
      style={{ marginTop: 0, paddingTop: 0 }}
    >
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight max-w-4xl"
      >
        Diagnose with Clarity, Heal with Confidence
      </motion.h1>

      {/* Animated Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed text-sky-600 font-medium"
      >
        Powered by AI, guided by empathy, and designed for seamless healthcare.
      </motion.p>

      {/* Dynamic Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-5"
      >
        {role === 'admin' && (
          <Link
            href="/dashboard/admin"
            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Go to Admin Panel
          </Link>
        )}

        {role === 'staff' && (
          <Link
            href="/dashboard/staff"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Go to Staff Dashboard
          </Link>
        )}

        {!role && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = '/auth/signup')}
              className="bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const features = document.getElementById('features');
                features?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white hover:bg-gray-50 text-sky-600 font-semibold py-3 px-8 rounded-full text-lg border border-sky-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Learn More
            </motion.button>
          </>
        )}
      </motion.div>
    </section>
  );
};

export default Hero;