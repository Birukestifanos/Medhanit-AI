'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Team Data
const teamMembers = [
  {
    id: 1,
    name: 'Samson Tariku',
    role: 'Data Scientist',
    image: '/sami.JPG',
    bio: 'Turning data into life-saving insights with precision and purpose.',
  },
  {
    id: 2,
    name: 'Abenezer Daniel',
    role: 'API Engineer',
    image: '/abeni.jpg',
    bio: 'Architecting robust, scalable systems for seamless healthcare delivery.',
  },
  {
    id: 3,
    name: 'Nataa Solomon',
    role: 'Backend Developer',
    image: '/nati.jpg',
    bio: 'Building secure, reliable foundations for AI-powered diagnostics.',
  },
  {
    id: 4,
    name: 'Biruk Istifanos',
    role: 'UI/UX Designer',
    image: '/bura.jpg',
    bio: 'Designing empathetic, intuitive experiences that empower patients and staff.',
  },
  {
    id: 5,
    name: 'Leta Eshetu',
    role: 'Frontend Developer',
    image: '/leta.jpg',
    bio: 'Bringing MedAnit to life with clean, responsive, and elegant code.',
  },
];

const TeamSection = () => {
  const [activeIndex, setActiveIndex] = useState(1); // Center card
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % teamMembers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleClick = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false); // Pause auto-play on manual interaction
  };

  const handleCardClick = (index: number) => {
    // Only advance if clicked card is not active
    if (index !== activeIndex) {
      handleClick(index);
    }
  };

  return (
    <section className="w-full bg-gradient-to-br from-sky-50 via-white to-blue-50 py-28 px-6 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 text-center space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Meet the MedAnit Team
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A dedicated team of clinicians, researchers, and engineers building the future of AI-powered healthcare.
          </p>
        </motion.div>

        {/* Team Carousel */}
        <div className="flex justify-center items-center gap-6 overflow-hidden">
          {teamMembers.map((member, index) => {
            const isActive = index === activeIndex;
            const isLeft = index === (activeIndex - 1 + teamMembers.length) % teamMembers.length;
            const isRight = index === (activeIndex + 1) % teamMembers.length;

            return (
              <motion.div
                key={member.id}
                onClick={() => handleCardClick(index)}
                className={`cursor-pointer transition-all duration-500 ease-in-out transform ${
                  isActive
                    ? 'scale-105 opacity-100 z-20'
                    : isLeft || isRight
                    ? 'scale-90 opacity-70 z-10'
                    : 'scale-80 opacity-40 z-0'
                } bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl p-6 w-[280px] sm:w-[320px] border border-sky-100`}
                whileHover={isActive ? { y: -6 } : { scale: 0.93 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                {/* Image */}
                <div className="relative mb-5">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className={`rounded-full object-cover border-4 transition-all duration-500 ${
                      isActive
                        ? 'border-sky-400/60 shadow-lg scale-100'
                        : 'border-sky-200 shadow-md scale-95'
                    }`}
                  />
                  {/* Glow Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-300/30 to-blue-400/30 opacity-0 blur-md"
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${
                    isActive ? 'text-sky-700' : 'text-gray-800'
                  }`}>
                    {member.name}
                  </h3>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-sky-600' : 'text-gray-600'
                  }`}>
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed mt-2">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {teamMembers.map((_, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'bg-sky-500 scale-125 shadow-md'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`View ${teamMembers[index].name}`}
            />
          ))}
        </div>

        {/* Auto-play Notice */}
        <p className="text-xs text-gray-500">
          {isAutoPlaying ? 'Auto-advancing' : 'Paused on interaction'} — click any member to focus
        </p>
      </div>
    </section>
  );
};

export default TeamSection;