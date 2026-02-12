'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import MobileLink from '@/components/mobile/MobileLink';

export default function MobileLoginPage() {
  const router = useRouter();
  const { login, isLoading, error, setError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      router.push('/mobile');
    } catch (err: any) {
      if (err?.message?.includes('Network Error')) {
        setLocalError('Network error: Check your connection or API URL.');
      } else if (err?.response?.status === 0) {
        setLocalError('CORS or network error: Check API server.');
      } else {
        setLocalError(error || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#151515] border border-[#232323] rounded-2xl p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white">Login</h1>
            <p className="text-xs text-slate-400">Sign in to WebWorlds</p>
          </div>

          {(localError || error) && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-[#2b2b2b] bg-[#101010] pl-9 pr-3 py-2 text-sm text-white"
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-[#2b2b2b] bg-[#101010] pl-9 pr-9 py-2 text-sm text-white"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-blue-600 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <MobileLink href="/forgot-password" className="hover:text-white">
              Forgot password?
            </MobileLink>
            <MobileLink href="/signup" className="text-blue-300">
              Sign up
            </MobileLink>
          </div>
        </div>
      </div>
    </div>
  );
}


