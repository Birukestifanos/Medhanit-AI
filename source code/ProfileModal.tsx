'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Define types
interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  organization: string;
  role: string;
  avatar?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  fetchUserData: () => void; // ✅ Add this prop
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  userData, 
  fetchUserData 
}: ProfileModalProps) {
  const [formData, setFormData] = useState({
    fullName: userData.fullName || '',
    phone: userData.phone || '',
    address: userData.address || '',
    organization: userData.organization || '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(userData.avatar || null);
  const [loading, setLoading] = useState(false);

  // Sync form when userData changes
  useEffect(() => {
    setFormData({
      fullName: userData.fullName || '',
      phone: userData.phone || '',
      address: userData.address || '',
      organization: userData.organization || '',
    });
    setAvatar(userData.avatar || null);
  }, [userData]);

  const handleSubmit = async () => {
    setError(null);
    if (!formData.fullName) {
      setError('Full name is required');
      toast.error('Full name is required');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Not authenticated');
        toast.error('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:4000/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Use Bearer token
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          organization: formData.organization,
          password: password || undefined,
          avatar: avatar || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      toast.success('Profile updated successfully!');
      console.log('✅ [ProfileModal] Profile updated:', updatedUser);
      
      // ✅ Call fetchUserData from props to refresh context
      await fetchUserData();

      onClose();
    } catch (err: any) {
      console.error('🔐 [ProfileModal] Update profile error:', err.message);
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
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
          className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full mx-4 border border-sky-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 pb-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50">
            <h3 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Edit Profile
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
          <div className="p-6 space-y-6">
            {error && (
              <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password (optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setAvatar(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white/80 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all"
              />
              {avatar && (
                <div className="mt-2 flex items-center space-x-3">
                  <img src={avatar} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 pt-4 bg-gray-50/50 rounded-b-3xl border-t border-sky-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform transition-all"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}