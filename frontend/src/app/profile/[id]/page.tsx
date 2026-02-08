'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { User, Mail, Trophy, Gamepad2, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Profile {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  stats: {
    gamesCreated: number;
    gamesPlayed: number;
    totalPlayTime: number;
    followers: number;
  };
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      // Fallback: use current user data if viewing own profile
      if (isOwnProfile && currentUser) {
        setProfile({
          _id: currentUser._id,
          username: currentUser.username,
          email: currentUser.email,
          createdAt: currentUser.createdAt,
          stats: currentUser.stats || {
            gamesCreated: 0,
            gamesPlayed: 0,
            totalPlayTime: 0,
            followers: 0,
          },
        });
      } else {
        const response = await api.get(`/users/${userId}`);
        setProfile(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Profile not found'}</p>
          <Link href="/games" className="text-blue-400 hover:text-blue-300 font-semibold">
            Back to games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-5xl font-bold text-white">
                {profile.username[0].toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">{profile.username}</h1>
              <div className="flex flex-col sm:flex-row gap-4 text-slate-400 mb-4">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Calendar size={18} />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-4 justify-center sm:justify-start">
                {isOwnProfile ? (
                  <Link
                    href="/profile/edit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      isFollowing
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
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
              value: profile.stats?.gamesCreated ?? 0,
            },
            {
              icon: Trophy,
              label: 'Games Played',
              value: profile.stats?.gamesPlayed ?? 0,
            },
            {
              icon: Mail,
              label: 'Play Time (hours)',
              value: profile.stats?.totalPlayTime ?? 0,
            },
            { icon: User, label: 'Followers', value: profile.stats?.followers ?? 0 },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <stat.icon className="text-blue-400 mb-2" size={32} />
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Games Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Games</h2>
          <div className="text-slate-400 text-center py-8">
            {profile.stats?.gamesCreated === 0
              ? 'This user hasn\'t created any games yet.'
              : `View all ${profile.stats?.gamesCreated} games created by this user`}
          </div>
        </div>
      </div>
    </div>
  );
}
