'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/shared/AppLink';

export default function MobileSignupPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      setLocalError('You must agree to the terms');
      return;
    }

    try {
      await register(username, email, password);
      router.push('/');
    } catch (err) {
      setLocalError(error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#151515] border border-[#232323] rounded-2xl p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white">Sign Up</h1>
            <p className="text-xs text-slate-400">Create your WebWorlds account</p>
          </div>

          {(localError || error) && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500" size={16} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-xl border border-[#2b2b2b] bg-[#101010] pl-9 pr-3 py-2 text-sm text-white"
                autoComplete="username"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-[#2b2b2b] bg-[#101010] pl-9 pr-3 py-2 text-sm text-white"
                autoComplete="email"
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
                autoComplete="new-password"
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

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-[#2b2b2b] bg-[#101010] pl-9 pr-9 py-2 text-sm text-white"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-slate-500"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <label className="flex items-start gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1"
              />
              <span>
                I agree to the{' '}
                <AppLink href="/terms" className="text-blue-300">
                  Terms of Service
                </AppLink>{' '}
                and{' '}
                <AppLink href="/privacy" className="text-blue-300">
                  Privacy Policy
                </AppLink>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-blue-600 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <AppLink href="/login" className="text-blue-300">
              Login
            </AppLink>
          </p>
        </div>
      </div>
    </div>
  );
}
