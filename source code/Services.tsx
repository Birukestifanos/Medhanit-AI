'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCog,
  HeartPulse,
  ShieldCheck,
  UserCheck,
  ActivitySquare,
  ServerCog,
  Sparkles,
} from 'lucide-react';

// Service Data
const services = [
  {
    title: 'AI-Powered Diagnosis',
    description: 'Top-3 disease predictions using SVC models and fuzzy symptom matching.',
    icon: <BrainCog className="w-7 h-7 text-sky-600" />,
  },
  {
    title: 'Real-Time Dashboard',
    description: 'Diabetes and heart insights in dynamic, patient-friendly layouts.',
    icon: <ActivitySquare className="w-7 h-7 text-sky-600" />,
  },
  {
    title: 'Secure Role Access',
    description: 'Doctors, staff & patients powered by JWT, bcrypt, and MongoDB Atlas.',
    icon: <ShieldCheck className="w-7 h-7 text-sky-600" />,
  },
  {
    title: 'Clinical UX/UI',
    description: 'Empathetic interfaces that promote comfort, clarity, and trust.',
    icon: <UserCheck className="w-7 h-7 text-sky-600" />,
  },
  {
    title: 'Scalable Architecture',
    description: 'Type-safe, modular FastAPI/TS stack with premium folder hygiene.',
    icon: <ServerCog className="w-7 h-7 text-sky-600" />,
  },
  {
    title: 'Personalized Predictions',
    description: 'Fuzzy symptom matching + metadata logging — backed by science.',
    icon: <HeartPulse className="w-7 h-7 text-sky-600" />,
  },
];

const Services = () => {
  return (
    <section className="w-full bg-gradient-to-br from-sky-50 via-white to-blue-50 py-28 px-6 overflow-hidden">
      {/* Header + Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-4xl mx-auto mb-16 text-center space-y-6"
      >
        {/* Sparkle Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 mb-6 mx-auto"
        >
          <Sparkles className="text-white w-7 h-7" />
        </motion.div>

        {/* Title */}
        <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Why MedAnit?
        </h2>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We merge clinical intelligence with design empathy — empowering patients and providers in every interaction.
        </p>
      </motion.div>

      {/* Responsive Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {services.map((service, index) => (
          <ServiceCard key={index} service={service} index={index} />
        ))}
      </div>

      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>
    </section>
  );
};

// Reusable Animated Service Card
const ServiceCard = ({ service, index }: { service: typeof services[0]; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.03 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.15 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl p-7 border border-sky-100 transition-all duration-500 cursor-default relative group"
    >
      {/* Icon Container */}
      <div className="flex items-center justify-center w-14 h-14 mb-5 mx-auto bg-sky-100 rounded-full group-hover:bg-sky-200 transition-colors duration-300">
        {service.icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-800 text-center mb-3 group-hover:text-sky-600 transition-colors duration-300">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm text-center leading-relaxed">
        {service.description}
      </p>

      {/* Hover Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-sky-400/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ zIndex: 0 }}
      />
    </motion.div>
  );
};

export default Services;