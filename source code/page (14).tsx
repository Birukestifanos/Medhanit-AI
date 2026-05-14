'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import StaffModal from '../components/StaffModal';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  status: 'active' | 'inactive';
}

export default function StaffPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'staff' | null>(null);

  const { user: authUser, error: authError, fetchUserData } = useAuth();

  // Sync with AuthContext user and error
  useEffect(() => {
    if (!authUser) {
      setError(authError || 'Not authenticated. Please log in.');
      setTimeout(() => router.push('/auth/login'), 3000);
    } else if (authUser.role !== 'admin') {
      setError('Access denied. Admin role required.');
      setTimeout(() => router.push('/auth/login'), 3000);
    } else {
      setRole(authUser.role);
      setError(null);
    }
  }, [authUser, authError, router]);

  // Fetch staff list
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      console.log('🔑 Fetching registered users');
      const res = await fetch('http://localhost:4000/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 /users response status:', res.status, 'OK:', res.ok);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch users (Status: ${res.status})`);
      }

      const data = await res.json();
      console.log('✅ Users data response:', JSON.stringify(data, null, 2));

      setStaffList(
        data.map((user: any) => ({
          id: user._id || '',
          name: user.fullName || 'Unknown',
          email: user.email || 'N/A',
          role: user.role || 'staff',
          status: user.active ? 'active' : 'inactive',
        }))
      );
    } catch (err: any) {
      console.error('🔐 Fetch users error:', err.message, { status: err.status, url: 'http://localhost:4000/users' });
      setError(err.message || 'Error fetching registered users.');
    } finally {
      setLoading(false);
    }
  };

  // Load staff on mount
  useEffect(() => {
    if (role === 'admin') {
      fetchStaff();
    }
  }, [role]);

  // Handle Add/Edit Staff
  const handleSaveStaff = async (staffData: Omit<Staff, 'id' | 'status'> & { id?: string }) => {
    setError(null);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      console.log('🔑 Saving user:', staffData);
      let res;
      if (staffData.id) {
        res = await fetch(`http://localhost:4000/users/${staffData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: staffData.name,
            email: staffData.email,
            role: staffData.role,
          }),
        });
      } else {
        res = await fetch('http://localhost:4000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: staffData.name,
            email: staffData.email,
            role: staffData.role,
            password: 'defaultPassword123', // Should be handled securely in real app
            phone: '',
            address: '',
            organization: 'Medanit',
            active: true,
          }),
        });
      }

      console.log('🔍 Save user response status:', res.status, 'OK:', res.ok);
      if (!res.ok) {
        const errorData = await res.json();
        console.log('🔍 Save user error response:', errorData);
        throw new Error(errorData.error || `Failed to ${staffData.id ? 'update' : 'add'} user (Status: ${res.status})`);
      }

      const updatedStaff = await res.json();
      console.log('✅ User saved:', updatedStaff);

      setStaffList((prev) =>
        staffData.id
          ? prev.map((staff) =>
              staff.id === staffData.id
                ? { ...staff, name: updatedStaff.fullName, email: updatedStaff.email, role: updatedStaff.role }
                : staff
            )
          : [
              ...prev,
              {
                id: updatedStaff._id || '',
                name: updatedStaff.fullName || 'Unknown',
                email: updatedStaff.email || 'N/A',
                role: updatedStaff.role || 'staff',
                status: updatedStaff.active ? 'active' : 'inactive',
              },
            ]
      );

      setIsModalOpen(false);
      setEditingStaff(null);
      alert(`${staffData.id ? 'User updated' : 'User added'} successfully!`);
    } catch (err: any) {
      console.error(`🔐 ${staffData.id ? 'Update' : 'Add'} user error:`, err.message, { status: err.status });
      setError(err.message || `Failed to ${staffData.id ? 'update' : 'add'} user. Please try again.`);
    }
  };

  // Handle Toggle Status (Active/Inactive)
  const handleToggleStatus = async (id: string) => {
    setError(null);
    try {
      const staff = staffList.find((s) => s.id === id);
      if (!staff) throw new Error('User not found.');

      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      console.log('🔑 Toggling status for user:', { id, currentStatus: staff.status });
      const res = await fetch(`http://localhost:4000/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ active: staff.status === 'inactive' }),
      });

      console.log('🔍 Toggle status response status:', res.status, 'OK:', res.ok);
      if (!res.ok) {
        const errorData = await res.json();
        console.log('🔍 Toggle status error response:', errorData);
        throw new Error(errorData.error || `Failed to toggle status (Status: ${res.status})`);
      }

      const updatedStaff = await res.json();
      console.log('✅ User status updated:', updatedStaff);

      setStaffList((prev) =>
        prev.map((staff) =>
          staff.id === id ? { ...staff, status: updatedStaff.active ? 'active' : 'inactive' } : staff
        )
      );
      alert('User status updated successfully!');
    } catch (err: any) {
      console.error('🔐 Toggle status error:', err.message, { status: err.status });
      setError(err.message || 'Failed to toggle user status. Please try again.');
    }
  };

  // Handle Delete
  const handleDeleteStaff = (id: string) => {
    setStaffToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;
    setError(null);
    try {
      console.log('🔑 Deleting user:', { id: staffToDelete });

      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch(`http://localhost:4000/users/${staffToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 Delete user response status:', res.status, 'OK:', res.ok);
      if (!res.ok) {
        const errorData = await res.json();
        console.log('🔍 Delete user error response:', errorData);
        throw new Error(errorData.error || `Failed to delete user (Status: ${res.status})`);
      }

      console.log('✅ User deleted:', { id: staffToDelete });
      setStaffList((prev) => prev.filter((staff) => staff.id !== staffToDelete));
      setStaffToDelete(null);
      setIsDeleteConfirmOpen(false);
      alert('User deleted successfully!');
    } catch (err: any) {
      console.error('🔐 Delete user error:', err.message, { status: err.status });
      setError(err.message || 'Failed to delete user. Please try again.');
    }
  };

  // Actions
  const handleAddStaff = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
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
              Staff Management
            </h1>
            <p className="text-gray-600 mt-1">Manage admin and staff accounts.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddStaff}
            className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform transition-all"
          >
            ➕ Add Staff
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
          <div className="flex justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mr-3"></div>
            <span className="text-sky-700">Loading staff...</span>
          </div>
        )}

        {/* Staff Table */}
        {!loading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-sky-100">
            <table className="w-full">
              <thead className="bg-sky-50">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {staffList.map((staff, index) => (
                  <motion.tr
                    key={`${staff.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(12, 165, 236, 0.04)' }}
                    className="transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{staff.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{staff.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          staff.role === 'admin'
                            ? 'bg-violet-100 text-violet-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {staff.role === 'admin' ? '👑' : '👨‍⚕️'} {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(staff.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                          staff.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {staff.status === 'active' ? (
                          <>
                            <CheckCircleIcon className="w-4 h-4" /> <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-4 h-4" /> <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditStaff(staff)}
                        className="p-2 text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        aria-label={`Edit ${staff.name}`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        aria-label={`Delete ${staff.name}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        <StaffModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStaff(null);
          }}
          onSave={handleSaveStaff}
          staff={editingStaff || undefined}
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
                  Are you sure you want to delete this user? This action cannot be undone.
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
                    disabled={loading}
                    className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transform transition-all"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}