'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  status: 'active' | 'inactive';
}

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: Omit<Staff, 'id' | 'status'> & { id?: string }) => Promise<void>;
  staff?: Staff | null; // ✅ Renamed from `editingStaff` to `staff`
}

export default function StaffModal({ isOpen, onClose, onSave, staff }: StaffModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'staff',
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize form when `staff` changes
  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        role: staff.role || 'staff',
      });
    } else {
      setFormData({ name: '', email: '', role: 'staff' });
    }
    setError(null);
  }, [staff]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Full name is required.');
      }
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error('A valid email is required.');
      }
      if (!['admin', 'staff'].includes(formData.role)) {
        throw new Error('Invalid role selected.');
      }

      await onSave({
        id: staff?.id, // Pass id only if editing
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
    } catch (err: any) {
      console.error('🔐 StaffModal submit error:', err.message);
      setError(err.message || 'Failed to save user. Please try again.');
    }
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
              {staff ? 'Edit User' : 'Add New User'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Sarah Mitchell"
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. sarah@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Role */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-1">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 appearance-none cursor-pointer pr-10"
                >
                  <option value="staff">👨‍⚕️ Medical Staff</option>
                  <option value="admin">👑 Admin</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-11 text-gray-400">
                  ▼
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 pt-4 bg-gray-50/50 rounded-b-3xl border-t border-sky-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200"
            >
              {staff ? 'Update User' : 'Add User'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}