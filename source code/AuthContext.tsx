'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  organization: string;
  role: 'admin' | 'staff';
  active: boolean;           // ✅ Add this
  lastLogin?: string;        // ✅ Add this (optional)
}
interface AuthContextType {
  user: User | null;
  error: string | null;
  fetchUserData: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  error: null,
  fetchUserData: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ✅ Fetch user data
  const fetchUserData = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:4000/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      if (!['admin', 'staff'].includes(data.role)) {
        throw new Error('Invalid role');
      }

      const userData: User = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        organization: data.organization || '',
        role: data.role,
        active: data.active,         // ✅ Add this
        lastLogin: data.LastLogin
      };

      setUser(userData);
      setError(null);
    } catch (err: any) {
      console.error('🔐 [AuthContext] Fetch user error:', err.message);
      setUser(null);
      setError(err.message);
      localStorage.removeItem('jwt');
      router.push('/auth/login');
    }
  };

  // ✅ Logout
  const logout = async () => {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        await fetch('http://localhost:4000/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Logout request failed (ignored)');
      }
    }
    localStorage.removeItem('jwt');
    setUser(null);
    setError(null);
    router.push('/auth/login');
  };

  // ✅ On mount: try to restore session
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      fetchUserData();
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, error, fetchUserData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);