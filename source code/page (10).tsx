'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import PatientModal from '../components/patientModal';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
}

interface Prediction {
  top_predictions: { disease: string; confidence: number }[];
  metadata: {
    disease: string;
    description: string;
    medications: string[];
    diet: string[];
    workout: string[];
    precautions: string[];
    symptoms: string[];
    patientId: string;
    name?: string;
    age?: number;
    contact?: string;
  };
}

export default function PatientsPage() {
  const router = useRouter();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'staff' | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const { user, error: authError } = useAuth();

  // Sync with AuthContext user and error
  useEffect(() => {
    if (user) {
      setStaffId(user.id);
      setRole(user.role);
    }
    if (authError) {
      setError(authError);
      router.push('/auth/login');
    }
  }, [user, authError, router]);

  // === 🔐 Fetch Data ===
  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'admin') return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('jwt');
        if (!token) throw new Error('No token found');

        // Fetch patients
        const patientsRes = await fetch('http://localhost:4000/patients', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!patientsRes.ok) {
          if (patientsRes.status === 403) throw new Error('Admin access required');
          if (patientsRes.status === 401) throw new Error('Invalid or expired token. Please log in again.');
          if (patientsRes.status === 404) throw new Error('Patients endpoint not found. Please check the server.');
          const errorData = await patientsRes.json();
          throw new Error(errorData.message || `Failed to fetch patients (status: ${patientsRes.status})`);
        }

        const patientsData = await patientsRes.json();
        console.log('✅ [PatientsPage] Fetched patients:', JSON.stringify(patientsData, null, 2));
        setPatientList(patientsData);

      } catch (err: any) {
        console.error('🔐 [PatientsPage] Fetch data error:', err.message);
        setError(err.message || 'Error fetching data.');
        // Mock data for demo
        setPatientList([
          {
            id: '68803b813024fc274e3b8448',
            patientId: 'PAT001',
            name: 'John Doe',
            age: 30,
            gender: 'male',
            contact: '1234567890',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  // === ✏️ Save Patient ===
  const handleSavePatient = async (patientData: Omit<Patient, 'id'> & { id?: string }) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch(`http://localhost:4000/patients${editingPatient ? `/${editingPatient.id}` : ''}`, {
        method: editingPatient ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${editingPatient ? 'update' : 'add'} patient (status: ${res.status})`);
      }

      const updatedPatient = await res.json();
      console.log(`✅ [PatientsPage] ${editingPatient ? 'Updated' : 'Added'} patient:`, JSON.stringify(updatedPatient, null, 2));
      setPatientList((prev) =>
        editingPatient
          ? prev.map((p) => (p.id === editingPatient.id ? updatedPatient : p))
          : [...prev, updatedPatient]
      );
      setIsModalOpen(false);
      setEditingPatient(null);
      alert(`${editingPatient ? 'Patient updated' : 'Patient added'} successfully!`);
    } catch (err: any) {
      console.error('🔐 [PatientsPage] Save patient error:', err.message);
      setError(err.message || 'Error saving patient.');
      if (err.message.includes('auth') || err.message.includes('token')) {
        router.push('/auth/login');
      }
    }
  };

  // === 🗑️ Delete Patient ===
  const confirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch(`http://localhost:4000/patients/${patientToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to delete patient (status: ${res.status})`);
      }

      console.log('✅ [PatientsPage] Deleted patient:', patientToDelete);
      setPatientList((prev) => prev.filter((p) => p.id !== patientToDelete));
      setPatientToDelete(null);
      setIsDeleteConfirmOpen(false);
      alert('Patient deleted successfully!');
    } catch (err: any) {
      console.error('🔐 [PatientsPage] Delete patient error:', err.message);
      setError(err.message || 'Error deleting patient.');
      if (err.message.includes('auth') || err.message.includes('token')) {
        router.push('/auth/login');
      }
    }
  };

  // === 🔬 Predict Disease ===
  const handlePredictDisease = async (patient: Patient, symptoms: string) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
          patientId: patient.patientId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }

      const data = await res.json();
      data.metadata.symptoms = symptoms.split(',').map(s => s.trim()).filter(s => s);
      data.metadata.patientId = patient.patientId;
      data.metadata.name = patient.name;
      data.metadata.age = patient.age;
      data.metadata.contact = patient.contact;

      setPrediction(data);
      setShowPredictionModal(true);
      alert('Prediction completed! Click "Save Diagnosis" to store it.');
    } catch (err: any) {
      console.error('🔬 [PatientsPage] Predict disease error:', err.message);
      setError(err.message || 'Error predicting disease.');
      if (err.message.includes('auth') || err.message.includes('token')) {
        router.push('/auth/login');
      }
    }
  };

  // === 💾 Save Prediction ===
  const handleSavePrediction = async () => {
    if (!prediction || !staffId) return;

    setSaveLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const patient = patientList.find((p) => p.patientId === prediction.metadata.patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const res = await fetch('http://localhost:4000/patients/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: prediction.metadata.patientId,
          top_predictions: prediction.top_predictions,
          metadata: {
            ...prediction.metadata,
            name: patient.name,
            age: patient.age,
            contact: patient.contact,
          },
          staffId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to save prediction (status: ${res.status})`);
      }

      console.log('✅ [PatientsPage] Saved prediction:', JSON.stringify(await res.json(), null, 2));
      setShowPredictionModal(false);
      setPrediction(null);
      alert('Prediction saved successfully!');
    } catch (err: any) {
      console.error('🔐 [PatientsPage] Save prediction error:', err.message);
      setError(err.message || 'Error saving prediction.');
      if (err.message.includes('auth') || err.message.includes('token')) {
        router.push('/auth/login');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <section className="min-h-screen px-6 py-12 bg-gradient-to-br from-sky-50 via-white to-blue-50 text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent">
              Patient Management
            </h1>
            <p className="text-gray-600 mt-1">Manage patient records, predict diseases, and track health.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingPatient(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform transition-all"
          >
            ➕ Add Patient
          </motion.button>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mr-3"></div>
            <span className="text-sky-700">Loading patients...</span>
          </div>
        )}

        {/* Patient Table */}
        {!loading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-sky-100">
            <table className="w-full">
              <thead className="bg-sky-50">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Age</th>
                  <th className="px-6 py-4 text-left">Gender</th>
                  <th className="px-6 py-4 text-left">Contact</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {patientList.map((patient, index) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(12, 165, 236, 0.04)' }}
                    className="transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{patient.patientId}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{patient.name}</td>
                    <td className="px-6 py-4 text-gray-600">{patient.age}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{patient.gender}</td>
                    <td className="px-6 py-4 text-gray-600">{patient.contact}</td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingPatient(patient);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        aria-label={`Edit ${patient.name}`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setPatientToDelete(patient.id);
                          setIsDeleteConfirmOpen(true);
                        }}
                        className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        aria-label={`Delete ${patient.name}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const symptoms = prompt(`Enter symptoms for ${patient.name} (comma-separated):`);
                          if (symptoms) handlePredictDisease(patient, symptoms);
                        }}
                        className="p-2 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        aria-label={`Predict for ${patient.name}`}
                      >
                        <BeakerIcon className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        <PatientModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPatient(null);
          }}
          onSave={handleSavePatient}
          patient={editingPatient || undefined}
        />

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteConfirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-sky-100"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this patient? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="px-5 py-2 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transform transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prediction Modal */}
        {showPredictionModal && prediction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full mx-4 border border-sky-100 overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Prediction Results</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-700">Top Predictions</h4>
                    <ul className="space-y-2 mt-2">
                      {prediction.top_predictions.map((pred, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{pred.disease}</span>
                          <span className="text-gray-600">{(pred.confidence * 100).toFixed(2)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Description</h4>
                    <p className="text-gray-600">{prediction.metadata.description}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">Medications</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {prediction.metadata.medications?.map((med, i) => (
                          <li key={i}>{med}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Diet</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {prediction.metadata.diet?.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Workout</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {prediction.metadata.workout?.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Precautions</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {prediction.metadata.precautions?.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={() => setShowPredictionModal(false)}
                    className="px-5 py-2 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSavePrediction}
                    disabled={saveLoading}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md hover:shadow-lg transform transition-all"
                  >
                    {saveLoading ? 'Saving...' : 'Save Diagnosis'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}