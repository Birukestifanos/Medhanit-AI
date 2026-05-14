'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserGroupIcon, ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

// ✅ Define Variants type for TypeScript
import { Variants } from 'framer-motion';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  organization: string;
  role: 'admin' | 'staff';
  active: boolean;
  lastLogin?: string;
}

interface Patient {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [staffCount, setStaffCount] = useState(0);
  const [predictionsCount, setPredictionsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser, error: authError, fetchUserData } = useAuth();
  const router = useRouter();

  // Sync with AuthContext user and error
  useEffect(() => {
    if (!authUser) {
      setError(authError || 'Not authenticated. Please log in.');
      router.push('/auth/login');
    } else if (authUser.role !== 'admin') {
      setError('Access denied. Admin role required.');
      router.push('/auth/login');
    } else {
      setUser({
        id: authUser.id || '',
        fullName: authUser.fullName || 'Unknown',
        email: authUser.email || 'Unknown',
        phone: authUser.phone || '',
        address: authUser.address || '',
        organization: authUser.organization || '',
        role: authUser.role || 'Unknown',
        active: authUser.active || false,
        lastLogin: authUser.lastLogin || undefined,
      });
      setError(null);
    }
  }, [authUser, authError, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('jwt');
        if (!token) throw new Error('No token found');

        // Fetch user data
        const userRes = await fetch('http://localhost:4000/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!userRes.ok) throw new Error(`Failed to fetch user: ${userRes.status}`);
        const userData = await userRes.json();

        // Fetch staff
        const usersRes = await fetch('http://localhost:4000/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!usersRes.ok) throw new Error(`Failed to fetch users: ${usersRes.status}`);
        const usersData = await usersRes.json();
        const activeStaff = usersData.filter((u: User) => u.active).length;
        setStaffCount(activeStaff);

        // Fetch predictions count
        const predictionsRes = await fetch('http://localhost:8000/predictions?page=1&limit=1', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!predictionsRes.ok) throw new Error(`Failed to fetch predictions: ${predictionsRes.status}`);
        const predictionsData = await predictionsRes.json();
        setPredictionsCount(predictionsData.pagination?.totalItems || 0);

        // Fetch patients
        const patientsRes = await fetch('http://localhost:4000/patients', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!patientsRes.ok) throw new Error(`Failed to fetch patients: ${patientsRes.status}`);
        const patientsData = await patientsRes.json();
        setPatientsCount(patientsData.length);

      } catch (err: any) {
        console.error('❌ [AdminDashboard] Fetch error:', err.message);
        setError('Failed to load dashboard data. Please try again.');
        setStaffCount(0);
        setPredictionsCount(0);
        setPatientsCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (authUser && authUser.role === 'admin') {
      fetchData();
    }
  }, [authUser]);

  // ✅ Fixed & typed variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15,
      } as const,
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="max-w-7xl mx-auto mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back,{' '}
              <span className="font-semibold text-sky-700">{user?.fullName || 'Admin'}</span>
            </p>
          </div>
          {user && (
            <div className="text-sm text-gray-500 bg-white/70 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm border border-sky-100">
              Role: <span className="font-medium text-sky-700">{user.role}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error & Loading */}
      <AnimatePresence mode="wait">
        {(error || authError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto mb-6 text-center bg-red-50 text-red-700 py-3 px-6 rounded-xl border border-red-200 shadow-sm"
          >
            {error || authError}
          </motion.div>
        )}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto text-center py-10"
          >
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mr-3"></div>
            <span className="text-sky-700 font-medium">Loading dashboard data...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Only Stats Cards (Total Staff, Total Predictions, Total Patients) */}
      {!loading && !error && !authError && (
        <motion.div
          className="max-w-7xl mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md">
                  <UserGroupIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Staff</p>
                  <p className="text-3xl font-bold text-sky-700">{staffCount}</p>
                </div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-teal-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md">
                  <ChartBarIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Predictions</p>
                  <p className="text-3xl font-bold text-teal-700">{predictionsCount}</p>
                </div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
                  <UserIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Patients</p>
                  <p className="text-3xl font-bold text-emerald-700">{patientsCount}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Decorative Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-1/3 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      
    </motion.div>
  );
}