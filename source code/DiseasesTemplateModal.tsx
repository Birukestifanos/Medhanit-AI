'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';

interface DiseaseTemplate {
  id?: string;
  disease: string;
  description: string;
  precautions: string[];
  medication: string[];
  workout: string[];
  diet: string[];
}

interface DiseaseTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: DiseaseTemplate) => void;
  editingTemplate: DiseaseTemplate | null;
}

export default function DiseaseTemplateModal({ isOpen, onClose, onSave, editingTemplate }: DiseaseTemplateModalProps) {
  const [disease, setDisease] = useState('');
  const [description, setDescription] = useState('');
  const [precautions, setPrecautions] = useState('');
  const [medication, setMedication] = useState('');
  const [workout, setWorkout] = useState('');
  const [diet, setDiet] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editingTemplate) {
      setDisease(editingTemplate.disease);
      setDescription(editingTemplate.description);
      setPrecautions(editingTemplate.precautions.join('\n'));
      setMedication(editingTemplate.medication.join('\n'));
      setWorkout(editingTemplate.workout.join('\n'));
      setDiet(editingTemplate.diet.join('\n'));
    } else {
      setDisease('');
      setDescription('');
      setPrecautions('');
      setMedication('');
      setWorkout('');
      setDiet('');
    }
  }, [editingTemplate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingTemplate?.id,
      disease,
      description,
      precautions: precautions.split('\n').filter((item) => item.trim()),
      medication: medication.split('\n').filter((item) => item.trim()),
      workout: workout.split('\n').filter((item) => item.trim()),
      diet: diet.split('\n').filter((item) => item.trim()),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {editingTemplate ? 'Edit Disease Template' : 'Add Disease Template'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="disease"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Disease Name
            </label>
            <input
              id="disease"
              type="text"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="precautions"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Precautions (one per line)
            </label>
            <textarea
              id="precautions"
              value={precautions}
              onChange={(e) => setPrecautions(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="medication"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Medication (one per line)
            </label>
            <textarea
              id="medication"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="workout"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Workout (one per line)
            </label>
            <textarea
              id="workout"
              value={workout}
              onChange={(e) => setWorkout(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="diet"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Diet (one per line)
            </label>
            <textarea
              id="diet"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}