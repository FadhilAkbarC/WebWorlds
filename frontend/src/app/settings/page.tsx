'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Lock, Trash2, LogOut } from 'lucide-react';

export default function SettingsPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/profile" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
          <ArrowLeft size={20} />
          Back to Profile
        </Link>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 shadow-xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
          </div>

          {/* Notifications */}
          <section className="border-b border-slate-700 pb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell size={24} />
              Notifications
            </h2>
            <div className="space-y-4">
              {[
                { id: 'email', label: 'Email Notifications', desc: 'Receive email updates about your account' },
                { id: 'messages', label: 'Message Notifications', desc: 'Get notified when someone messages you' },
                { id: 'gameUpdates', label: 'Game Updates', desc: 'Stay updated on games you created' },
              ].map((setting) => (
                <label key={setting.id} className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[setting.id as keyof typeof notifications]}
                    onChange={(e) =>
                      setNotifications(prev => ({ ...prev, [setting.id]: e.target.checked }))
                    }
                    className="mt-1 rounded w-5 h-5"
                  />
                  <div>
                    <p className="text-white font-medium">{setting.label}</p>
                    <p className="text-slate-400 text-sm">{setting.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Security */}
          <section className="border-b border-slate-700 pb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock size={24} />
              Security
            </h2>
            <div className="space-y-3">
              <Link
                href="/change-password"
                className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
              >
                Change Password
              </Link>
              <p className="text-slate-400 text-sm">
                Last password change: Never
              </p>
            </div>
          </section>

          {/* Account */}
          <section className="border-b border-slate-700 pb-8">
            <h2 className="text-xl font-bold text-white mb-4">Account</h2>
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <p className="text-slate-400 text-sm">Email: <span className="text-white font-medium">{user.email}</span></p>
              <p className="text-slate-400 text-sm">Two-Factor Authentication: <span className="text-red-400">Not enabled</span></p>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <Trash2 size={24} />
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
              <div>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-900 hover:bg-red-800 text-red-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
                <p className="text-red-300 text-sm mt-2">This action cannot be undone</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
