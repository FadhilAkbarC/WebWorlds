'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Bell, Lock, Trash2, LogOut } from 'lucide-react';
import AppLink from '@/components/shared/AppLink';

export default function MobileSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState({
    email: true,
    messages: true,
    gameUpdates: true,
  });

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      alert('Account deletion is not yet available. Please contact support.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 pt-4 space-y-4">
      <AppLink href="/profile" className="text-xs text-blue-300">
        ? Back to Profile
      </AppLink>

      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 space-y-4">
        <h1 className="text-lg font-semibold text-white">Settings</h1>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bell size={16} /> Notifications
          </h2>
          {[
            { id: 'email', label: 'Email Notifications' },
            { id: 'messages', label: 'Message Notifications' },
            { id: 'gameUpdates', label: 'Game Updates' },
          ].map((setting) => (
            <label key={setting.id} className="flex items-center gap-3 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={notifications[setting.id as keyof typeof notifications]}
                onChange={(e) =>
                  setNotifications((prev) => ({ ...prev, [setting.id]: e.target.checked }))
                }
              />
              {setting.label}
            </label>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Lock size={16} /> Security
          </h2>
          <AppLink
            href="/change-password"
            className="block rounded-full border border-[#2b2b2b] px-4 py-2 text-center text-xs text-slate-200"
          >
            Change Password
          </AppLink>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Account</h2>
          <div className="rounded-xl border border-[#2b2b2b] bg-[#121212] p-3 text-xs text-slate-300">
            <p>Email: {user.email}</p>
            <p className="text-slate-400">Two-Factor Authentication: Not enabled</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-red-300 flex items-center gap-2">
            <Trash2 size={16} /> Danger Zone
          </h2>
          <button
            onClick={handleLogout}
            className="w-full rounded-full bg-red-600 py-2 text-xs font-semibold text-white"
          >
            <LogOut size={14} className="inline mr-1" /> Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full rounded-full border border-red-500/50 py-2 text-xs font-semibold text-red-200"
          >
            Delete Account
          </button>
        </section>
      </div>
    </div>
  );
}
