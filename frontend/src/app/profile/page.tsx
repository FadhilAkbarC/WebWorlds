'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Trophy, Gamepad2, Calendar, Heart } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Please login to view your profile</p>
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-5xl font-bold text-white">
                {user.username[0].toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">{user.username}</h1>
              <div className="flex flex-col sm:flex-row gap-4 text-slate-400 mb-4">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail size={18} />
                  {user.email}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Calendar size={18} />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-4 justify-center sm:justify-start">
                <Link
                  href="/profile/edit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Edit Profile
                </Link>
                <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: Gamepad2,
              label: 'Games Created',
              value: user.stats?.gamesCreated ?? 0,
            },
            {
              icon: Trophy,
              label: 'Games Played',
              value: user.stats?.gamesPlayed ?? 0,
            },
            {
              icon: Heart,
              label: 'Games Liked',
              value: user.stats?.totalPlayTime ?? 0,
            },
            { icon: User, label: 'Followers', value: user.stats?.followers ?? 0 },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <stat.icon className="text-blue-400 mb-2" size={32} />
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          {/* Recent Games */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">My Games</h2>
            <div className="text-slate-400 text-center py-8">
              You haven't created any games yet.{' '}
              <Link href="/editor" className="text-blue-400 hover:text-blue-300">
                Create one now
              </Link>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="text-slate-400 text-center py-8">
              No recent activity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
