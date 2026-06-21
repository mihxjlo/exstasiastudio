'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { setAuthToken } from '@/lib/auth';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      setAuthToken(response.token);
      // Also set cookie so middleware can read it
      document.cookie = `exstasia_jwt=${response.token}; path=/; max-age=${Math.floor(response.expiresIn / 1000)}`;
      router.push('/admin');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Invalid credentials');
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ex-admin px-4">
      <div className="bg-zinc-900 rounded-lg p-8 w-full max-w-sm">
        {/* Wordmark */}
        <h1 className="text-ex-text text-center text-lg tracking-[0.15em] lowercase font-light mb-8">
          exstasia studio
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            id="admin-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-ex-pink transition-colors duration-150"
            required
          />
          <input
            id="admin-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-ex-pink transition-colors duration-150"
            required
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="bg-white text-black font-medium rounded px-4 py-2 w-full hover:bg-zinc-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
