// components/AuthForm.tsx
import { useState } from 'react';

interface AuthFormProps {
  type: 'login' | 'signup';
  onSubmit: (data: { email: string; password: string }) => void;
  loading: boolean;
}

export default function AuthForm({ type, onSubmit, loading }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. you@example.com"
          className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
          disabled={loading}
        />
      </div>

      {type === 'login' && (
        <div className="text-right">
          <button
            type="button"
            className="text-xs text-sky-600 hover:text-sky-700 hover:underline transition"
            onClick={() => alert('Password reset link sent!')}
          >
            Forgot password?
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (type === 'login' ? 'Signing In...' : 'Creating Account...') : type === 'login' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
}