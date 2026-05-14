'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

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

interface Patient {
  id: string;
  anonymizedId: string;
  age: number;
  gender: string;
  addedBy: string;
}

interface PatientPredictionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export default function PatientPredictionsModal({ isOpen, onClose, patient }: PatientPredictionsModalProps) {
  // Placeholder predictions data (replace with API call)
  const predictions: Prediction[] = patient
    ? [
        {
          id: '1',
          patientId: patient.anonymizedId,
          disease: 'Flu',
          symptoms: ['Fever', 'Cough', 'Fatigue'],
          staff: 'Dr. Smith',
          date: '2025-07-22',
          description: 'A viral infection causing fever and respiratory issues.',
          precautions: ['Rest', 'Stay hydrated', 'Avoid contact with others'],
          medication: ['Ibuprofen', 'Antiviral'],
          workout: ['Light stretching'],
          diet: ['Soup', 'Fruits'],
        },
        {
          id: '2',
          patientId: patient.anonymizedId,
          disease: 'Hypertension',
          symptoms: ['High BP', 'Headache', 'Dizziness'],
          staff: 'Dr. Jones',
          date: '2025-07-21',
          description: 'Chronic high blood pressure requiring lifestyle changes.',
          precautions: ['Reduce salt intake', 'Monitor BP regularly'],
          medication: ['Lisinopril'],
          workout: ['Moderate cardio', 'Yoga'],
          diet: ['Low-sodium foods', 'Vegetables'],
        },
      ]
    : [];

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Predictions for {patient.anonymizedId}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Patient Details
            </h4>
            <p className="text-gray-800 dark:text-gray-200">
              ID: {patient.anonymizedId}, Age: {patient.age}, Gender: {patient.gender}, Added By: {patient.addedBy}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Predictions
            </h4>
            {predictions.length > 0 ? (
              <div className="space-y-4">
                {predictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <p className="text-gray-800 dark:text-gray-200">
                      <strong>Disease:</strong> {prediction.disease}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <strong>Symptoms:</strong> {prediction.symptoms.join(', ')}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <strong>Staff:</strong> {prediction.staff}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <strong>Date:</strong> {format(new Date(prediction.date), 'MMMM dd, yyyy')}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <strong>Description:</strong> {prediction.description}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <strong>Precautions:</strong> {prediction.precautions.join(', ')}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <strong>Medication:</strong> {prediction.medication.join(', ')}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <strong>Workout:</strong> {prediction.workout.join(', ')}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <strong>Diet:</strong> {prediction.diet.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No predictions found for this patient.
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}