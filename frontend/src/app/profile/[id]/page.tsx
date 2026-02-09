'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { User, Mail, Trophy, Gamepad2, Calendar, Heart, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { Game } from '@/types';

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
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const isOwnProfile = currentUser?._id === userId;

  const fetchUserGames = useCallback(async () => {
    if (!profile?._id) return;
    try {
      setIsLoadingGames(true);
      const response = await api.get(`/games/creator/${profile?._id}`);
      if (response.data.success || Array.isArray(response.data.data)) {
        setUserGames(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setUserGames(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user games:', error);
      setUserGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  }, [profile?._id]);

  const fetchProfile = useCallback(async () => {
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
        const response = await api.get(`/auth/profile/${userId}`);
        setProfile(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isOwnProfile, userId]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    void fetchUserGames();
  }, [fetchUserGames]);

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
          <h2 className="text-2xl font-bold text-white mb-4">Games by {profile.username}</h2>
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
              {profile.stats?.gamesCreated === 0
                ? `${profile.username} hasn't created any games yet.`
                : 'No games found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
