'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import AppLink from '@/components/shared/AppLink';

export default function MobileForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#151515] border border-[#232323] rounded-2xl p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white">Reset Password</h1>
            <p className="text-xs text-slate-400">We will email a reset link.</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-200">
              Check your email for password reset instructions!
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-[#2b2b2b] bg-[#101010] pl-9 pr-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-blue-600 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-300">
              We have sent a reset link to {email}.
            </p>
          )}

          <AppLink href="/login" className="text-xs text-blue-300">
            Back to login
          </AppLink>
        </div>
      </div>
    </div>
  );
}
