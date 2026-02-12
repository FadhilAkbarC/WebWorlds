'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import MobileLink from '@/components/mobile/MobileLink';

export default function MobileChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  React.useEffect(() => {
    if (!user) {
      router.push('/mobile/login');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess('Password changed successfully!');
      setTimeout(() => {
        router.push('/mobile/profile');
      }, 1500);
    } catch (err) {
      setError('Failed to change password');
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
      <MobileLink href="/profile/edit" className="text-xs text-blue-300">
        ? Back to Edit Profile
      </MobileLink>

      <div className="mt-4 rounded-2xl border border-[#232323] bg-[#161616] p-4 space-y-4">
        <h1 className="text-lg font-semibold text-white">Change Password</h1>

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
          {[
            { key: 'current', label: 'Current Password', name: 'currentPassword' },
            { key: 'new', label: 'New Password', name: 'newPassword' },
            { key: 'confirm', label: 'Confirm Password', name: 'confirmPassword' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs text-slate-300 mb-1">{field.label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input
                  type={showPasswords[field.key as keyof typeof showPasswords] ? 'text' : 'password'}
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#2b2b2b] bg-[#101010] pl-9 pr-9 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      [field.key]: !prev[field.key as keyof typeof prev],
                    }))
                  }
                  className="absolute right-3 top-2.5 text-slate-500"
                >
                  {showPasswords[field.key as keyof typeof showPasswords] ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-blue-600 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}


