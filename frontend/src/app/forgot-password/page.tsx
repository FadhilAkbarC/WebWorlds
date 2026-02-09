'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
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
      // For now, just show a success message
      // In a real implementation, you would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400">Enter your email to receive a password reset link</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-6">
              Check your email for password reset instructions!
            </div>
          )}

          {/* Form */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-300">
                We&apos;ve sent a password reset link to <strong>{email}</strong>. 
                Check your email and follow the instructions to reset your password.
              </p>
              <p className="text-slate-400 text-sm">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  try again
                </button>
              </p>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
