'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import AppLink from '@/components/shared/AppLink';

export default function MobileEditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    setFormData({
      username: user.username || '',
      email: user.email || '',
      avatar: user.avatar || '',
    });
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser = {
        ...user,
        ...formData,
      };
      setUser(updatedUser as any);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 pt-4">
      <AppLink href="/profile" className="text-xs text-blue-300">
        ? Back to Profile
      </AppLink>

      <div className="mt-4 rounded-2xl border border-[#232323] bg-[#161616] p-4 space-y-4">
        <h1 className="text-lg font-semibold text-white">Edit Profile</h1>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled
              className="w-full rounded-xl border border-[#2b2b2b] bg-[#101010] px-3 py-2 text-sm text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#2b2b2b] bg-[#101010] px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="flex gap-2">
            <AppLink
              href="/change-password"
              className="flex-1 rounded-full border border-[#2b2b2b] py-2 text-center text-xs text-slate-200"
            >
              Change Password
            </AppLink>
            <AppLink
              href="/settings"
              className="flex-1 rounded-full border border-[#2b2b2b] py-2 text-center text-xs text-slate-200"
            >
              Settings
            </AppLink>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-blue-600 py-2 text-xs font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={14} /> {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
