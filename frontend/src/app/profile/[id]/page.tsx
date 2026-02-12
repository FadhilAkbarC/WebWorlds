'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppLink from '@/components/shared/AppLink';
import { Award, BadgeCheck, Calendar, Gamepad2, ShieldCheck, Star, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Game } from '@/types';

interface Profile {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  stats: {
    gamesCreated: number;
    gamesPlayed: number;
    totalPlayTime: number;
    followers: number;
  };
}

interface Badge {
  name: string;
  description: string;
  earned: boolean;
  icon: React.ReactNode;
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'creations'>('about');
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/auth/profile/${userId}`);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUserGames = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoadingGames(true);
      const response = await api.get(`/games/creator/${userId}?limit=12`);
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
  }, [userId]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    void fetchUserGames();
  }, [fetchUserGames]);

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  const achievementBadges: Badge[] = useMemo(() => {
    const gamesCreated = profile?.stats?.gamesCreated ?? 0;
    const gamesPlayed = profile?.stats?.gamesPlayed ?? 0;
    const totalPlay =
      (profile?.stats as any)?.totalPlayTime ??
      (profile?.stats as any)?.totalPlaytime ??
      0;
    const creations = userGames.length;

    return [
      {
        name: 'Builder',
        description: 'Created first game',
        earned: gamesCreated > 0,
        icon: <Gamepad2 size={18} />,
      },
      {
        name: 'Explorer',
        description: 'Played 10 games',
        earned: gamesPlayed >= 10,
        icon: <Star size={18} />,
      },
      {
        name: 'Creator',
        description: 'Shared 3 creations',
        earned: creations >= 3,
        icon: <Award size={18} />,
      },
      {
        name: 'Veteran',
        description: `Joined ${joinedDate}`,
        earned: Boolean(profile?.createdAt),
        icon: <Calendar size={18} />,
      },
      {
        name: 'Committed',
        description: 'Played 60 minutes',
        earned: totalPlay >= 60,
        icon: <User size={18} />,
      },
    ];
  }, [joinedDate, profile?.createdAt, profile?.stats, userGames.length]);

  const isVerified = Boolean(
    (profile as any)?.verified ||
    (profile as any)?.isVerified ||
    (profile as any)?.badges?.verified
  );

  const isStaff = Boolean(
    (profile as any)?.staff ||
    (profile as any)?.isStaff ||
    (profile as any)?.role === 'staff' ||
    (profile as any)?.badges?.staff
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Profile not found'}</p>
          <AppLink href="/games" className="text-blue-400 hover:text-blue-300 font-semibold">
            Back to games
          </AppLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center ring-2 ring-slate-800">
              <span className="text-4xl font-bold">
                {profile.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                    <BadgeCheck size={14} />
                    Verified
                  </span>
                )}
                {isStaff && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/40 bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-200">
                    <ShieldCheck size={14} />
                    Staff
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">Joined {joinedDate}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-wrap gap-6 items-center lg:justify-end">
            <div className="text-center min-w-[110px]">
              <p className="text-2xl font-bold">{profile.stats?.gamesCreated ?? 0}</p>
              <p className="text-xs text-slate-400">Creations</p>
            </div>
            <div className="text-center min-w-[110px]">
              <p className="text-2xl font-bold">{profile.stats?.gamesPlayed ?? 0}</p>
              <p className="text-xs text-slate-400">Plays</p>
            </div>
            <div className="text-center min-w-[110px]">
              <p className="text-2xl font-bold">{profile.stats?.followers ?? 0}</p>
              <p className="text-xs text-slate-400">Followers</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold">
              Follow
            </button>
          </div>
        </div>

        <div className="mt-6 border-b border-slate-800 flex gap-6 text-sm">
          <button
            className={`pb-3 font-semibold ${
              activeTab === 'about' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`pb-3 font-semibold ${
              activeTab === 'creations' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400'
            }`}
            onClick={() => setActiveTab('creations')}
          >
            Creations
          </button>
        </div>

        {activeTab === 'about' ? (
          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-3">About</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {profile.bio || 'This user has not added an about section yet.'}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Username: {profile.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Joined: {joinedDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-1">Badges</h2>
              <p className="text-xs text-slate-500 mb-4">Decor &amp; achievements</p>
              <div className="space-y-3">
                {achievementBadges.map((badge) => (
                  <div
                    key={badge.name}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-slate-800 ${
                      badge.earned ? 'bg-slate-800/70' : 'bg-slate-900 opacity-50'
                    }`}
                  >
                    <div className="text-blue-300">{badge.icon}</div>
                    <div>
                      <p className="text-sm font-semibold">{badge.name}</p>
                      <p className="text-xs text-slate-400">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Creations</h2>
              <p className="text-sm text-slate-400">{userGames.length} games</p>
            </div>

            {isLoadingGames ? (
              <div className="text-slate-400 text-center py-8">Loading games...</div>
            ) : userGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGames.map((game) => (
                  <AppLink
                    key={game._id}
                    href={`/games/${game._id}`}
                    className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
                  >
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 h-36 flex items-center justify-center">
                      <Gamepad2 size={40} className="text-white opacity-60" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-1 truncate">{game.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {game.description || 'No description'}
                      </p>
                    </div>
                  </AppLink>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-8">No creations yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
