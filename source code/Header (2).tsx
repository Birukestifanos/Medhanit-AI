'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import LoadingModal from './LoadingModal';
import ProfileModal from './ProfileModal';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loadingNav, setLoadingNav] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    organization: '',
    role: '',
  });
  const router = useRouter();
  const { user, error: authError, fetchUserData } = useAuth();

  // Sync userData with AuthContext user
  useEffect(() => {
    console.log('🔍 [Header.tsx] User state:', user ? 'Logged in' : 'Not logged in', user);
    if (user) {
      setUserData({
        id: user.id || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        organization: user.organization || '',
        role: user.role || '',
      });
    } else {
      setUserData({
        id: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        organization: '',
        role: '',
      });
    }
  }, [user]);

  // 🔁 Auto-refresh user data every 5 minutes (no token refresh unless you have a refresh endpoint)
  useEffect(() => {
    if (user) {
      const refreshInterval = setInterval(() => {
        if (navigator.onLine) {
          console.log('🔍 [Header.tsx] Refreshing user data');
          fetchUserData(); // Uses localStorage + Bearer
        }
      }, 300000); // 5 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [user, fetchUserData]);

  // ✅ Logout: Clear localStorage only
  const handleLogout = async () => {
    setLoadingNav(true);
    try {
      const token = localStorage.getItem('jwt');
      if (token) {
        // Optional: notify backend (no cookie to clear)
        await fetch('http://localhost:4000/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      console.log('✅ [Header.tsx] Logged out successfully');
      setUserData({
        id: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        organization: '',
        role: '',
      });
      router.push('/auth/login');
    } catch (err) {
      console.error('❌ [Header.tsx] Logout error:', err);
      setError('Failed to log out. Please try again.');
    } finally {
      setLoadingNav(false);
    }
  };

  const navigateWithLoading = (href: string) => {
    setLoadingNav(true);
    setTimeout(() => {
      router.push(href);
    }, 600);
  };

  // ✅ Save Profile: Use Bearer token
  const handleSaveProfile = async (updatedData: {
    fullName: string;
    phone: string;
    address: string;
    organization: string;
  }) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No token found');

      const res = await fetch('http://localhost:4000/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await res.json();
      setUserData((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      console.log('✅ [Header.tsx] Profile updated:', updatedUser);
      setProfileOpen(false);
      await fetchUserData(); // Refresh AuthContext
    } catch (err: any) {
      console.error('❌ [Header.tsx] Profile update error:', err.message);
      setError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <>
      {/* Error Toast */}
      {(error || authError) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-50 text-red-700 px-6 py-3 text-center text-sm font-medium border-b border-red-200 z-50"
        >
          {error || authError}
        </motion.div>
      )}

      {/* Loading Modal for Navigation */}
      <LoadingModal visible={loadingNav} message="Loading page..." />

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full bg-white/90 backdrop-blur-md shadow-lg fixed top-0 z-50 border-b border-sky-100"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <span
            onClick={() => navigateWithLoading('/')}
            className="text-2xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent cursor-pointer"
          >
            MedAnit
          </span>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink onClick={() => navigateWithLoading('/')}>Home</NavLink>
            <NavLink onClick={() => navigateWithLoading('/page/about')}>About</NavLink>
            <NavLink onClick={() => navigateWithLoading('/patients')}>Patients</NavLink>
            <NavLink onClick={() => navigateWithLoading('/predict')}>Predictions</NavLink>
            <NavLink onClick={() => navigateWithLoading('/page/service')}>Service</NavLink>
            <NavLink onClick={() => navigateWithLoading('/page/contact')}>Contact</NavLink>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Profile Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border border-sky-200 hover:border-sky-400 px-3 py-2 rounded-xl shadow-sm transition-all"
                >
                  <FaUserCircle className="text-sky-600 text-xl" />
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                    {userData.fullName.split(' ')[0] || 'User'}
                  </span>
                </motion.button>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl hover:shadow-md transition-all font-semibold"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateWithLoading('/auth/login')}
                className="bg-gradient-to-r from-sky-500 to-blue-500 text-white px-5 py-2 rounded-xl hover:shadow-md transition-all font-semibold"
              >
                Login
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <motion.div
              animate={{ rotate: menuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                className="w-6 h-6 text-sky-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </motion.div>
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden bg-white/95 backdrop-blur-md border-t border-sky-100 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-3">
                <MobileLink onClick={() => navigateWithLoading('/')}>Home</MobileLink>
                <MobileLink onClick={() => navigateWithLoading('/page/about')}>About</MobileLink>
                <MobileLink onClick={() => navigateWithLoading('/patients')}>Patients</MobileLink>
                <MobileLink onClick={() => navigateWithLoading('/predict')}>Predictions</MobileLink>
                <MobileLink onClick={() => navigateWithLoading('/page/service')}>Service</MobileLink>
                <MobileLink onClick={() => navigateWithLoading('/page/contact')}>Contact</MobileLink>
                {user && (
                  <div className="pt-3 space-y-3 border-t border-sky-100">
                    <p className="text-sm text-gray-600">
                      Hi, <strong>{userData.fullName.split(' ')[0] || 'User'}</strong>
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setMenuOpen(false);
                        setProfileOpen(true);
                      }}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white py-2 rounded-xl hover:shadow-md transition-all text-sm font-semibold"
                    >
                      Edit Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-xl hover:shadow-md transition-all text-sm font-semibold"
                    >
                      Logout
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        userData={userData}
        fetchUserData={fetchUserData}
      />

      {/* Spacer to prevent content under header */}
      <div className="h-16"></div>
    </>
  );
};

// Reusable Components
const NavLink = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="text-gray-700 hover:text-sky-600 font-medium transition-colors relative group"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
  </button>
);

const MobileLink = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="block text-gray-700 hover:text-sky-600 font-medium py-2 border-b border-sky-50"
  >
    {children}
  </button>
);

export default Header;