'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import AdminModal from '../components/AdminModal';
import DiseaseTemplateModal from '../components/DiseasesTemplateModal';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

interface DiseaseTemplate {
  id: string;
  disease: string;
  description: string;
  precautions: string[];
  medication: string[];
  workout: string[];
  diet: string[];
}

interface AISettings {
  confidenceThreshold: number;
  autoSavePredictions: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user: authUser, error: authError } = useAuth();
  const [aiSettings, setAiSettings] = useState<AISettings>({
    confidenceThreshold: 0.85,
    autoSavePredictions: true,
  });
  const [diseaseTemplates, setDiseaseTemplates] = useState<DiseaseTemplate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DiseaseTemplate | null>(null);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for fallback
  const mockDiseaseTemplates: DiseaseTemplate[] = [
    {
      id: '1',
      disease: 'Flu',
      description: 'A viral infection causing fever and respiratory issues.',
      precautions: ['Rest', 'Stay hydrated', 'Avoid contact with others'],
      medication: ['Ibuprofen', 'Antiviral'],
      workout: ['Light stretching'],
      diet: ['Soup', 'Fruits'],
    },
    {
      id: '2',
      disease: 'Hypertension',
      description: 'Chronic high blood pressure requiring lifestyle changes.',
      precautions: ['Reduce salt intake', 'Monitor BP regularly'],
      medication: ['Lisinopril'],
      workout: ['Moderate cardio', 'Yoga'],
      diet: ['Low-sodium foods', 'Vegetables'],
    },
  ];

  // Sync with AuthContext user and error
  useEffect(() => {
    if (!authUser) {
      setError(authError || 'Not authenticated. Please log in.');
      setTimeout(() => router.push('/auth/login'), 3000);
    } else if (authUser.role !== 'admin') {
      setError('Access denied. Admin role required.');
      setTimeout(() => router.push('/auth/login'), 3000);
    } else {
      setError(null);
    }
  }, [authUser, authError, router]);

  // Fetch disease templates and AI settings
  useEffect(() => {
    const fetchData = async () => {
      if (!authUser || authUser.role !== 'admin') return;
      setLoading(true);
      setError(null);
      try {
        // Fetch disease templates
        const templatesRes = await fetch('http://localhost:4000/disease-templates', {
          method: 'GET',
          credentials: 'include', // Use HTTP-only cookie
        });
        if (!templatesRes.ok) {
          if (templatesRes.status === 403) throw new Error('Admin access required');
          if (templatesRes.status === 401) throw new Error('Invalid or expired token. Please log in again.');
          if (templatesRes.status === 404) throw new Error('Disease templates endpoint not found.');
          const errorData = await templatesRes.json();
          throw new Error(errorData.message || `Failed to fetch templates (status: ${templatesRes.status})`);
        }
        const templatesData = await templatesRes.json();
        console.log('✅ [SettingsPage] Fetched disease templates:', JSON.stringify(templatesData, null, 2));
        setDiseaseTemplates(templatesData);

        // Fetch AI settings
        const settingsRes = await fetch('http://localhost:4000/settings/ai', {
          method: 'GET',
          credentials: 'include',
        });
        if (!settingsRes.ok) {
          const errorData = await settingsRes.json();
          throw new Error(errorData.message || `Failed to fetch AI settings (status: ${settingsRes.status})`);
        }
        const settingsData = await settingsRes.json();
        console.log('✅ [SettingsPage] Fetched AI settings:', JSON.stringify(settingsData, null, 2));
        setAiSettings(settingsData);
      } catch (err: any) {
        console.error('🔐 [SettingsPage] Fetch data error:', err.message);
        setError(err.message || 'Error fetching data. Using mock data.');
        setDiseaseTemplates(mockDiseaseTemplates);
        setAiSettings({ confidenceThreshold: 0.85, autoSavePredictions: true });
      } finally {
        setLoading(false);
      }
    };
    if (authUser && authUser.role === 'admin') {
      fetchData();
    }
  }, [authUser]);

  // Handle AI settings
  const handleAiSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAiSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value),
    }));
  };

  const handleAiSettingsSave = async () => {
    try {
      const res = await fetch('http://localhost:4000/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(aiSettings),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to save AI settings (status: ${res.status})`);
      }
      console.log('✅ [SettingsPage] Saved AI settings:', JSON.stringify(aiSettings, null, 2));
      alert('AI settings saved successfully!');
    } catch (err: any) {
      console.error('🔐 [SettingsPage] Save AI settings error:', err.message);
      setError(err.message || 'Error saving AI settings.');
    }
  };

  // Handle disease templates
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template: DiseaseTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (templateData: Omit<DiseaseTemplate, 'id'> & { id?: string }) => {
    try {
      const res = await fetch(
        `http://localhost:4000/disease-templates${editingTemplate ? `/${editingTemplate.id}` : ''}`,
        {
          method: editingTemplate ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(templateData),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${editingTemplate ? 'update' : 'add'} template (status: ${res.status})`);
      }
      const savedTemplate = await res.json();
      console.log(`✅ [SettingsPage] ${editingTemplate ? 'Updated' : 'Added'} template:`, JSON.stringify(savedTemplate, null, 2));
      setDiseaseTemplates((prev) =>
        editingTemplate
          ? prev.map((t) => (t.id === savedTemplate.id ? savedTemplate : t))
          : [...prev, savedTemplate]
      );
      setIsModalOpen(false);
      setEditingTemplate(null);
      alert(`${editingTemplate ? 'Template updated' : 'Template added'} successfully!`);
    } catch (err: any) {
      console.error('🔐 [SettingsPage] Save template error:', err.message);
      setError(err.message || 'Error saving template.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/disease-templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to delete template (status: ${res.status})`);
      }
      console.log('✅ [SettingsPage] Deleted template:', id);
      setDiseaseTemplates((prev) => prev.filter((t) => t.id !== id));
      alert('Template deleted successfully!');
    } catch (err: any) {
      console.error('🔐 [SettingsPage] Delete template error:', err.message);
      setError(err.message || 'Error deleting template.');
    }
  };

  // Handle admin creation
  const handleCreateAdmin = async (adminData: { fullName: string; email: string; password: string }) => {
    try {
      const res = await fetch('http://localhost:4000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...adminData, role: 'admin' }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to create admin (status: ${res.status})`);
      }
      console.log('✅ [SettingsPage] Created admin:', JSON.stringify(adminData, null, 2));
      setIsCreateAdminModalOpen(false);
      alert('Admin created successfully!');
    } catch (err: any) {
      console.error('🔐 [SettingsPage] Create admin error:', err.message);
      setError(err.message || 'Error creating admin.');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen px-6 py-10 bg-gradient-to-br from-sky-50 via-white to-blue-50 text-gray-800"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-gray-600 mt-1">Configure admin accounts, AI behavior, and disease templates.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateAdminModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Create Admin
          </motion.button>
        </motion.div>

        {/* Error */}
        <AnimatePresence mode="wait">
          {(error || authError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 shadow-sm"
            >
              {error || authError}
              {(error?.includes('log in') || authError?.includes('log in')) && (
                <p className="mt-2">Redirecting to login shortly...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
            <span className="ml-4 text-sky-700 font-medium">Loading settings...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Admin Account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 p-8"
            >
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                <UserIcon className="w-6 h-6 text-sky-600" />
                Admin Account
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={authUser?.fullName || 'Loading...'}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50 text-gray-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={authUser?.email || 'Loading...'}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50 text-gray-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                  <div className="px-4 py-3 rounded-xl border border-violet-200 bg-violet-50 text-violet-800 font-medium inline-flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    {authUser?.role || 'Loading...'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Model Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 p-8"
            >
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                <CogIcon className="w-6 h-6 text-sky-600" />
                AI Model Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Confidence Threshold
                  </label>
                  <input
                    type="range"
                    name="confidenceThreshold"
                    min="0"
                    max="1"
                    step="0.01"
                    value={aiSettings.confidenceThreshold}
                    onChange={handleAiSettingsChange}
                    className="w-full h-2 bg-sky-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.0</span>
                    <span>{aiSettings.confidenceThreshold.toFixed(2)}</span>
                    <span>1.0</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Minimum confidence score required for a prediction to be displayed.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoSavePredictions"
                    name="autoSavePredictions"
                    checked={aiSettings.autoSavePredictions}
                    onChange={handleAiSettingsChange}
                    className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500"
                  />
                  <label htmlFor="autoSavePredictions" className="text-sm font-medium text-gray-700">
                    Auto-save AI predictions
                  </label>
                </div>

                <div className="flex justify-end pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAiSettingsSave}
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform transition-all"
                  >
                    Save AI Settings
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Disease Templates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <DocumentTextIcon className="w-6 h-6 text-sky-600" />
                  Disease Templates
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddTemplate}
                  className="flex items-center gap-2 px-5 py-3 mt-3 sm:mt-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform transition-all"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Template
                </motion.button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800 uppercase text-xs font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left">Disease</th>
                      <th className="px-6 py-4 text-left">Description</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {diseaseTemplates.map((template) => (
                      <motion.tr
                        key={template.id}
                        whileHover={{ backgroundColor: 'rgba(12, 165, 236, 0.04)' }}
                        className="transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">{template.disease}</td>
                        <td className="px-6 py-4 text-gray-600">{template.description}</td>
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditTemplate(template)}
                            className="p-2 text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 transition-all"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Disease Template Modal */}
      <DiseaseTemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        editingTemplate={editingTemplate}
      />

      {/* Create Admin Modal */}
      <AnimatePresence>
        {isCreateAdminModalOpen && (
          <AdminModal
            isOpen={isCreateAdminModalOpen}
            onClose={() => setIsCreateAdminModalOpen(false)}
            onSave={handleCreateAdmin}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/* Custom Styles for Range Slider */
const style = document.createElement('style');
style.textContent = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #6c63ff;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(108, 99, 255, 0.4);
  }
  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #6c63ff;
    cursor: pointer;
    border: none;
    box-shadow: 0 4px 10px rgba(108, 99, 255, 0.4);
  }
`;
document.head.appendChild(style);