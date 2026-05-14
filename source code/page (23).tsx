'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import LoadingModal from '../../components/LoadingModal';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const router = useRouter();
  const { fetchUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Clear any stale state if needed (optional)
  useEffect(() => {
    // Nothing to clear unless you want to reset on mount
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🔑 Attempting login with:', { email: formData.email });

      // 🔥 Login request — no credentials: 'include'
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is JSON
      if (!res.headers.get('content-type')?.includes('application/json')) {
        const text = await res.text();
        throw new Error(text || 'Invalid server response');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      // ✅ Expect token in response
      const { token, role, id } = data;
      if (!token) {
        throw new Error('No token received from server');
      }

      // ✅ Save token in localStorage
      localStorage.setItem('jwt', token);
      console.log('✅ Login successful, token saved in localStorage');

      // ✅ Fetch user data using Bearer token
      const meRes = await fetch('http://localhost:4000/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!meRes.ok) {
        const errData = await meRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch user data');
      }

      const userData = await meRes.json();
      console.log('✅ Verified user:', userData);

      // ✅ Sync with AuthContext
      await fetchUserData();

      // ✅ Redirect based on role
      switch (userData.role) {
        case 'admin':
        case 'staff':
          router.push('/');
          break;
        default:
          throw new Error(`Unknown role: ${userData.role}`);
      }
    } catch (err: any) {
      console.error('🔐 Login error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-12"
    >
      {/* Decorative Background Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-1/3 w-64 h-64 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 20 }}
        className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-sky-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 text-center border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your MedAnit account</p>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-center text-sm font-medium bg-red-50 border border-red-200 px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(v) => handleChange('email', v)}
              placeholder="e.g. you@example.com"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(v) => handleChange('password', v)}
              placeholder="••••••••"
            />

            <div className="text-right">
              <button
                type="button"
                className="text-xs text-sky-600 hover:text-sky-700 hover:underline transition"
                onClick={() => alert('Password reset link sent!')}
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Loading Modal */}
          <LoadingModal visible={loading} message="Authenticating your session..." />

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Don’t have an account?{' '}
              <Link href="/auth/signup" className="text-sky-600 font-medium hover:underline transition">
  Sign Up
</Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              By logging in, you agree to our{' '}
              <a href="/terms" className="underline hover:text-sky-600">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-sky-600">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;