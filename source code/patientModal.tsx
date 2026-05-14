'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Patient {
  id?: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
}

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: Omit<Patient, 'id'> & { id?: string }) => void;
  patient?: Patient | null; // ✅ Renamed & made optional
}

export default function PatientModal({ isOpen, onClose, onSave, patient }: PatientModalProps) {
  const [patientId, setPatientId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize form when `patient` changes
  useEffect(() => {
    if (patient) {
      setPatientId(patient.patientId);
      setName(patient.name);
      setAge(patient.age.toString());
      setGender(patient.gender);
      setContact(patient.contact);
    } else {
      setPatientId('');
      setName('');
      setAge('');
      setGender('');
      setContact('');
    }
    setError(null);
  }, [patient]);

  const handleSubmit = () => {
    if (!patientId || !name || !age || !gender || !contact) {
      setError('Please fill in all required fields (Patient ID, Name, Age, Gender, Contact)');
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0) {
      setError('Age must be a valid number');
      return;
    }
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      setError('Gender must be Male, Female, or Other');
      return;
    }
    onSave({
      patientId,
      name,
      age: ageNum,
      gender,
      contact,
    });
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full border border-sky-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 pb-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50">
            <h3 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              {patient ? 'Edit Patient' : 'Add New Patient'}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-full bg-white/70 hover:bg-white shadow-sm border border-sky-200 text-sky-600 transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 px-4 py-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Patient ID */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Patient ID *</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. PAT001"
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Age *</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">👨‍⚕️ Male</option>
                  <option value="Female">👩‍⚕️ Female</option>
                  <option value="Other">🧑 Other</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-11 text-gray-400">
                  ▼
                </div>
              </div>

              {/* Contact */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-1">Contact *</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. +1234567890"
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 pr-10"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 pt-4 bg-gray-50/50 rounded-b-3xl border-t border-sky-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200"
            >
              Save Patient
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}