'use client';

import Link from 'next/link';
import { FaUserMd, FaHeartbeat, FaClipboardList, FaCalendarAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingModal from '../../../components/LoadingModal';
import { useAuth } from '../../../context/AuthContext';

const StaffDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, error: authError, fetchUserData: authFetchUserData } = useAuth();

  // Fetch user data to verify auth
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch('http://localhost:4000/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Not authenticated. Please log in.');
      }

      const data = await res.json();
      console.log('✅ Fetched user data:', { id: data.id, role: data.role });
    } catch (err: any) {
      console.error('🔐 Fetch user data error:', err.message);
      setError(err.message || 'Error verifying authentication.');
      router.push('/auth/login');
    }
  };

  // 🔁 Auto-refresh user data (no token refresh unless you have a refresh endpoint)
  useEffect(() => {
    if (user) {
      // Optionally validate token still valid
      fetchUserData();
    } else {
      const token = localStorage.getItem('jwt');
      if (token) {
        fetchUserData(); // Restore session
      } else {
        router.push('/auth/login');
      }
    }

    // Optional: Re-validate every 3 minutes
    const refreshInterval = setInterval(() => {
      const token = localStorage.getItem('jwt');
      if (token) {
        fetchUserData();
      } else {
        clearInterval(refreshInterval);
        router.push('/auth/login');
      }
    }, 180000); // 3 minutes

    return () => clearInterval(refreshInterval);
  }, [router, user]);

  // Sync local error with AuthContext error
  useEffect(() => {
    if (authError) {
      setError(authError);
      router.push('/auth/login');
    }
  }, [authError, router]);

  const handleGetPrediction = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/patients'); // Use router instead of window.location
    }, 1200);
  };

  return (
    <section className="w-full min-h-screen bg-white text-gray-800">
      {/* 🌄 Hero */}
      <div className="relative h-[70vh] w-full overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/doctor.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/80 via-sky-800/70 to-cyan-700/70" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-6 space-y-4">
          <h1 className="text-4xl font-bold sm:text-5xl">Empower Clinical Decisions</h1>
          <p className="text-lg sm:text-xl max-w-3xl">
            Welcome back, clinician. Use AI-assisted tools to predict conditions, manage diagnostics, and elevate care.
          </p>
          <button
            onClick={handleGetPrediction}
            className="mt-4 px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-lg shadow-lg transition duration-300 animate-pulse"
          >
            Get Prediction
          </button>
        </div>
      </div>

      {/* 🧠 Functional Cards */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
          {[
            {
              title: 'Patient Records',
              icon: <FaClipboardList size={32} />,
              description: 'Review diagnostic history and notes.',
              href: '/patients',
            },
            {
              title: 'Flag Urgent Case',
              icon: <FaHeartbeat size={32} />,
              description: 'Report critical patient issues.',
              href: '/dashboard/staff/alerts',
            },
            {
              title: 'Schedule Follow-up',
              icon: <FaCalendarAlt size={32} />,
              description: 'Book check-ins and consultations.',
              href: '/dashboard/staff/schedule',
            },
            {
              title: 'Feedback & Insights',
              icon: <FaUserMd size={32} />,
              description: 'Share your clinical experience.',
              href: '/dashboard/staff/feedback',
            },
          ].map(({ title, icon, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group bg-white border border-gray-200 rounded-xl shadow-md p-6 text-center hover:shadow-lg hover:border-sky-300 transition"
            >
              <div className="flex justify-center items-center mb-4 text-sky-600 group-hover:scale-110 transition-transform">
                {icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ✅ Loading Modal */}
      <LoadingModal visible={loading} message="Initializing AI diagnostics..." />

      {/* Error Display */}
      {(error || authError) && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-lg z-50">
          {error || authError}
        </div>
      )}
    </section>
  );
};

export default StaffDashboard;