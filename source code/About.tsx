'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const About = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={mounted ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent"
          >
            About Medanit
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-gray-700 leading-relaxed"
          >
            Medanit is more than just prediction — it's{' '}
            <span className="font-semibold bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
              empathetic design and a personalized healthcare journey
            </span>
            . Our clinical AI backend meets a frontend built with care, enabling patients and doctors to explore diagnosis with clarity and confidence.
          </motion.p>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8"
          >
            {[
              { icon: '💡', label: 'AI-Powered' },
              { icon: '❤️', label: 'Empathetic Design' },
              { icon: '🔒', label: 'Secure & Private' },
              { icon: '🌍', label: 'Built for Ethiopia' },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-sky-100 shadow-sm"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-gray-700 font-medium text-sm">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={mounted ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          whileHover={{ scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-blue-500/20 rounded-2xl blur-lg scale-110 group-hover:scale-105 transition-transform duration-500"></div>
          <Image
            src="/female2.jpg"
            alt="Medanit Diagnostic Overview"
            width={500}
            height={400}
            className="rounded-2xl shadow-2xl border border-sky-200 relative z-10 object-cover"
            priority
          />
          {/* Decorative Corner */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full opacity-20 blur-xl"></div>
        </motion.div>
      </div>

      {/* Optional: Stats Section Below */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="max-w-5xl mx-auto mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
      >
        {[
          { number: '10K+', label: 'Patients Served' },
          { number: '98%', label: 'Accuracy Rate' },
          { number: '50+', label: 'Clinicians Using' },
          { number: '10', label: 'Hospitals Partnered' },
        ].map((stat, i) => (
          <div key={i} className="space-y-1">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="text-3xl font-extrabold text-sky-600"
            >
              {stat.number}
            </motion.span>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default About;