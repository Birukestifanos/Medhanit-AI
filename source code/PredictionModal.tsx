'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Prediction {
  id: string;
  patientId: string;
  disease: string;
  symptoms: string[];
  staff: string;
  date: string;
  description: string;
  precautions: string[];
  medication: string[];
  workout: string[];
  diet: string[];
}

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: Prediction | null;
}

export default function PredictionModal({ isOpen, onClose, prediction }: PredictionModalProps) {
  if (!prediction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-sky-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50">
              <h3 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Diagnosis Report
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
              {/* Patient ID */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Patient ID</label>
                <div className="px-4 py-3 rounded-xl bg-sky-50 text-sky-800 font-mono text-sm border border-sky-200">
                  {prediction.patientId}
                </div>
              </div>

              {/* Disease */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Disease</label>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 font-semibold border border-emerald-200">
                  {prediction.disease}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Symptoms</label>
                <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200">
                  {prediction.symptoms.join(', ') || 'No symptoms recorded'}
                </div>
              </div>

              {/* Staff */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Staff</label>
                <div className="px-4 py-3 rounded-xl bg-violet-50 text-violet-800 border border-violet-200">
                  {prediction.staff}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <div className="px-4 py-3 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                  {format(new Date(prediction.date), 'MMMM dd, yyyy')}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <p className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 leading-relaxed">
                  {prediction.description}
                </p>
              </div>

              {/* Lists: Precautions, Medication, Workout, Diet */}
              {[
                { label: 'Precautions', data: prediction.precautions, color: 'amber' },
                { label: 'Medication', data: prediction.medication, color: 'indigo' },
                { label: 'Workout', data: prediction.workout, color: 'emerald' },
                { label: 'Diet', data: prediction.diet, color: 'sky' },
              ].map(({ label, data, color }, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                  <ul className={`space-y-2 p-4 rounded-xl bg-${color}-50 border border-${color}-200`}>
                    {data.length > 0 ? (
                      data.map((item, idx) => (
                        <li key={idx} className={`text-${color}-800 flex items-start space-x-2`}>
                          <span className={`text-${color}-500 mt-1.5`}>•</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className={`text-${color}-500 text-sm italic`}>No {label.toLowerCase()} listed.</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 pt-4 bg-gray-50/50 rounded-b-3xl border-t border-sky-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}