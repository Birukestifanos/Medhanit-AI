'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BeakerIcon, DocumentTextIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import LoadingModal from '../../../components/LoadingModal';

// Mock Data
const patients = [
  {
    id: '1',
    name: 'Kidus T.',
    age: 32,
    gender: 'male',
    diagnosis: 'Type 2 Diabetes',
    confidence: 0.92,
    lastUpdated: 'July 18, 2025',
    contact: '+251 911 234 567',
  },
  {
    id: '2',
    name: 'Sara M.',
    age: 28,
    gender: 'female',
    diagnosis: 'Hypertension',
    confidence: 0.88,
    lastUpdated: 'July 16, 2025',
    contact: '+251 922 345 678',
  },
  {
    id: '3',
    name: 'Yared K.',
    age: 45,
    gender: 'male',
    diagnosis: 'Asthma',
    confidence: 0.95,
    lastUpdated: 'July 15, 2025',
    contact: '+251 933 456 789',
  },
  {
    id: '4',
    name: 'Lemlem A.',
    age: 36,
    gender: 'female',
    diagnosis: 'Thyroid Disorder',
    confidence: 0.85,
    lastUpdated: 'July 14, 2025',
    contact: '+251 944 567 890',
  },
];

const PatientsPage = () => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const handleAction = (patientId: string, action: string) => {
    setSelectedPatient(patientId);
    setLoadingAction(action);
    // Simulate API call
    setTimeout(() => {
      setLoadingAction(null);
      setSelectedPatient(null);
      if (action === 'predict') {
        alert('AI diagnosis initiated!');
      } else {
        alert('Opening medical history...');
      }
    }, 1200);
  };

  return (
    <section className="min-h-screen px-6 py-12 bg-gradient-to-br from-sky-50 via-white to-blue-50 text-gray-800">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Patient Records
        </h1>
        <p className="text-gray-600">
          View diagnosis history, confidence levels, and initiate AI-powered assessments.
        </p>
      </div>

      {/* Patient Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {patients.map((patient, i) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-sky-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-sky-100 rounded-full">
                    <UserCircleIcon className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{patient.name}</h3>
                    <p className="text-gray-600">{patient.age} • {patient.gender}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Diagnosis */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Diagnosis</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-medium text-gray-800">{patient.diagnosis}</span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        patient.confidence > 0.9
                          ? 'bg-green-100 text-green-800'
                          : patient.confidence > 0.8
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {(patient.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Confidence Level</label>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${patient.confidence * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                    />
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-sm text-gray-500">
                  Last updated: <strong>{patient.lastUpdated}</strong>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center p-6 pt-4 bg-gray-50/50 rounded-b-2xl border-t border-sky-100">
                <button
                  onClick={() => handleAction(patient.id, 'history')}
                  disabled={loadingAction !== null}
                  className="flex items-center space-x-2 px-4 py-2 text-sky-600 hover:text-sky-700 font-medium rounded-lg hover:bg-sky-50 transition"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => handleAction(patient.id, 'predict')}
                  disabled={loadingAction !== null}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <BeakerIcon className="w-4 h-4" />
                  <span>{loadingAction === 'predict' && selectedPatient === patient.id ? 'Processing...' : 'Predict'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Loading Modal */}
      <LoadingModal
        visible={loadingAction !== null}
        message={
          loadingAction === 'predict'
            ? 'Running AI diagnosis...'
            : 'Loading medical history...'
        }
      />
    </section>
  );
};

export default PatientsPage;