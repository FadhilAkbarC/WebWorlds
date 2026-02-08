'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Game } from '@/types';
import { User, Mail, Trophy, Gamepad2, Calendar, Heart, Play } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchUserGames();
    }
  }, [user?._id]);

  const fetchUserGames = async () => {
    try {
      setIsLoadingGames(true);
      const response = await api.get(`/games/creator/${user?._id}`);
      if (response.data.success) {
        setUserGames(response.data.data || []);
      } else {
        setUserGames(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch user games:', error);
      setUserGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  };

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
                <Link
                  href="/settings"
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Settings
                </Link>
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

        {/* My Games Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">My Games</h2>
          {isLoadingGames ? (
            <div className="text-slate-400 text-center py-8">Loading games...</div>
          ) : userGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userGames.map((game) => (
                <Link
                  key={game._id}
                  href={`/games/${game._id}`}
                  className="bg-slate-700 rounded-lg overflow-hidden border border-slate-600 hover:border-blue-500 transition-colors group"
                >
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 h-40 flex items-center justify-center relative">
                    <Gamepad2 size={48} className="text-white opacity-30" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black bg-opacity-40 flex items-center justify-center transition-opacity">
                      <Play size={32} className="text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 truncate">{game.title}</h3>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                      {game.description || 'No description'}
                    </p>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>❤️ {game.likes || 0}</span>
                      <span>👁️ {game.plays || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8">
              You haven't created any games yet.{' '}
              <Link href="/editor" className="text-blue-400 hover:text-blue-300">
                Create one now
              </Link>
            </div>
          )}
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
  );
}
