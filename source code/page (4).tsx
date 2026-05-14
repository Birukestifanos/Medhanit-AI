'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PencilIcon, TrashIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import LoadingModal from '../components/LoadingModal';
import { useAuth } from '../context/AuthContext';

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: 'male',
    contact: '',
  });

  const router = useRouter();
  const { user, error: authError, logout } = useAuth();

  // Fetch patients
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch(`http://localhost:4000/patients?search=${search}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Authentication required');
        throw new Error('Failed to fetch patients');
      }

      const data = await res.json();
      setPatients(data);
      console.log('✅ Fetched patients:', data);
    } catch (err: any) {
      console.error('🔐 Fetch patients error:', err.message);
      setError(err.message);
      logout(); // Clear state and redirect
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Patient
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch('http://localhost:4000/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: formData.patientId,
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          contact: formData.contact,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add patient');
      }

      const newPatient = await res.json();
      setPatients([...patients, newPatient]);
      setShowAddModal(false);
      setFormData({ patientId: '', name: '', age: '', gender: 'male', contact: '' });
      alert('Patient added successfully!');
    } catch (err: any) {
      console.error('🔐 Add patient error:', err.message);
      setError(err.message);
      if (err.message.includes('auth') || err.message.includes('token')) {
        logout();
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Edit Patient
  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      if (!selectedPatient) throw new Error('No patient selected');

      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch(`http://localhost:4000/patients/${selectedPatient.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          contact: formData.contact,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update patient');
      }

      const updatedPatient = await res.json();
      setPatients(patients.map(p => (p.id === updatedPatient.id ? updatedPatient : p)));
      setShowEditModal(false);
      setSelectedPatient(null);
      setFormData({ patientId: '', name: '', age: '', gender: 'male', contact: '' });
      alert('Patient updated successfully!');
    } catch (err: any) {
      console.error('🔐 Update patient error:', err.message);
      setError(err.message);
      if (err.message.includes('auth') || err.message.includes('token')) {
        logout();
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete Patient
  const handleDeletePatient = async () => {
    setFormLoading(true);
    setError(null);

    try {
      if (!selectedPatient) throw new Error('No patient selected');

      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch(`http://localhost:4000/patients/${selectedPatient.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete patient');
      }

      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      setShowDeleteModal(false);
      setSelectedPatient(null);
      alert('Patient deleted successfully!');
    } catch (err: any) {
      console.error('🔐 Delete patient error:', err.message);
      setError(err.message);
      if (err.message.includes('auth') || err.message.includes('token')) {
        logout();
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      patientId: patient.patientId,
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      contact: patient.contact,
    });
    setShowEditModal(true);
  };

  // 🔁 Fetch patients when user or search changes
  useEffect(() => {
    if (user) {
      fetchPatients();
    } else if (!authError) {
      // If no user and no error, maybe token exists but not loaded
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Session expired. Please log in.');
        router.push('/auth/login');
      }
    }
  }, [search, user, authError, router]);

  // 🔁 Sync auth error
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen px-6 py-12 bg-gradient-to-br from-sky-50 via-white to-blue-50 text-gray-800"
    >
      {/* Decorative Background Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-1/3 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent">
              Patient Management
            </h1>
            <p className="text-gray-600 mt-1">Manage records, diagnose, and track patient health.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform transition-all"
          >
            ➕ Add Patient
          </motion.button>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-center text-sm font-medium bg-red-50 border border-red-200 px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* Search */}
        <div className="flex justify-between gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient ID or Name"
            className="flex-1 px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
          />
        </div>

        {/* Loading */}
        <LoadingModal visible={loading} message="Loading patient records..." />

        {/* Empty State */}
        {!loading && patients.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No patients found.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-sky-600 hover:text-sky-700 font-medium underline"
            >
              Add your first patient
            </button>
          </div>
        )}

        {/* Patients Grid */}
        {!loading && patients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {patients.map((patient, i) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>ID:</strong> {patient.patientId}</p>
                  <p><strong>Age:</strong> {patient.age}</p>
                  <p><strong>Gender:</strong> {patient.gender}</p>
                  <p><strong>Contact:</strong> {patient.contact}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link
                    href="/predict"
                    className="flex-1 py-2 bg-sky-500 text-white text-center rounded-lg hover:bg-sky-600 transition text-sm"
                  >
                    Predict
                  </Link>
                  <button
                    onClick={() => openEditModal(patient)}
                    className="p-2 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Add Patient Modal */}
        {showAddModal && (
          <>
            <LoadingModal visible={formLoading} message="Adding new patient..." />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full border border-sky-100"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Add New Patient</h3>
                <form onSubmit={handleAddPatient} className="space-y-4">
                  <Input label="Patient ID" value={formData.patientId} onChange={(v) => setFormData({ ...formData, patientId: v })} />
                  <Input label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                  <Input label="Age" type="number" value={formData.age} onChange={(v) => setFormData({ ...formData, age: v })} />
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input label="Contact" value={formData.contact} onChange={(v) => setFormData({ ...formData, contact: v })} />
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setFormData({ patientId: '', name: '', age: '', gender: 'male', contact: '' });
                      }}
                      className="px-5 py-2 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md hover:shadow-lg transform transition-all"
                    >
                      {formLoading ? 'Adding...' : 'Add Patient'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Edit Patient Modal */}
        {showEditModal && selectedPatient && (
          <>
            <LoadingModal visible={formLoading} message="Updating patient..." />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full border border-sky-100"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Patient</h3>
                <form onSubmit={handleEditPatient} className="space-y-4">
                  <Input label="Patient ID" value={formData.patientId} disabled />
                  <Input label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                  <Input label="Age" type="number" value={formData.age} onChange={(v) => setFormData({ ...formData, age: v })} />
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input label="Contact" value={formData.contact} onChange={(v) => setFormData({ ...formData, contact: v })} />
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedPatient(null);
                        setFormData({ patientId: '', name: '', age: '', gender: 'male', contact: '' });
                      }}
                      className="px-5 py-2 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl shadow-md hover:shadow-lg transform transition-all"
                    >
                      {formLoading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedPatient && (
          <>
            <LoadingModal visible={formLoading} message="Deleting patient..." />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full border border-sky-100"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <strong>{selectedPatient.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedPatient(null);
                    }}
                    className="px-5 py-2 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePatient}
                    disabled={formLoading}
                    className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transform transition-all"
                  >
                    {formLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    </motion.section>
  );
}

// Reusable Input Component
function Input({ label, type = 'text', value, onChange, disabled }: {
  label: string;
  type?: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={disabled ? undefined : (e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 ${disabled ? 'bg-sky-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}