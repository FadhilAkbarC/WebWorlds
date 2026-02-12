'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, BadgeCheck, Calendar, Gamepad2, ShieldCheck, Star, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Game } from '@/types';
import MobileLink from '@/components/mobile/MobileLink';

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

export default function MobilePublicProfilePage() {
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
      const response = await api.get(`/games/creator/${userId}?limit=8`);
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
    const creations = userGames.length;

    return [
      {
        name: 'Builder',
        description: 'Created first game',
        earned: gamesCreated > 0,
        icon: <Gamepad2 size={14} />,
      },
      {
        name: 'Explorer',
        description: 'Played 10 games',
        earned: gamesPlayed >= 10,
        icon: <Star size={14} />,
      },
      {
        name: 'Creator',
        description: 'Shared 3 creations',
        earned: creations >= 3,
        icon: <Award size={14} />,
      },
      {
        name: 'Veteran',
        description: `Joined ${joinedDate}`,
        earned: Boolean(profile?.createdAt),
        icon: <Calendar size={14} />,
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
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-sm">{error || 'Profile not found'}</p>
          <MobileLink href="/games" className="text-blue-400 text-sm">
            Back to games
          </MobileLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 pt-4">
      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">{profile.username[0].toUpperCase()}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white">{profile.username}</h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                  <BadgeCheck size={12} /> Verified
                </span>
              )}
              {isStaff && (
                <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/40 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-200">
                  <ShieldCheck size={12} /> Staff
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Joined {joinedDate}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
          <div>
            <p className="text-white font-semibold">{profile.stats?.gamesCreated ?? 0}</p>
            Creations
          </div>
          <div>
            <p className="text-white font-semibold">{profile.stats?.gamesPlayed ?? 0}</p>
            Plays
          </div>
          <div>
            <p className="text-white font-semibold">{profile.stats?.followers ?? 0}</p>
            Followers
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 text-xs">
        {['about', 'creations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'about' | 'creations')}
            className={`flex-1 rounded-full border px-3 py-1 ${
              activeTab === tab
                ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                : 'border-[#2b2b2b] text-slate-400'
            }`}
          >
            {tab === 'about' ? 'About' : 'Creations'}
          </button>
        ))}
      </div>

      {activeTab === 'about' ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4">
            <h2 className="text-sm font-semibold text-white mb-2">About</h2>
            <p className="text-xs text-slate-300">
              {profile.bio || 'This user has not added an about section yet.'}
            </p>
            <div className="mt-3 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <User size={12} /> Username: {profile.username}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={12} /> Joined: {joinedDate}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4">
            <h2 className="text-sm font-semibold text-white">Badges</h2>
            <div className="mt-3 space-y-2">
              {achievementBadges.map((badge) => (
                <div
                  key={badge.name}
                  className={`flex items-center gap-2 rounded-xl border border-[#2b2b2b] p-2 text-xs ${
                    badge.earned ? 'bg-[#121212] text-slate-200' : 'bg-[#101010] text-slate-500'
                  }`}
                >
                  <span className="text-blue-300">{badge.icon}</span>
                  <div>
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-[10px] text-slate-400">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {isLoadingGames ? (
            <div className="text-xs text-slate-400">Loading games...</div>
          ) : userGames.length > 0 ? (
            <div className="space-y-2">
              {userGames.map((game) => (
                <MobileLink
                  key={game._id}
                  href={`/games/${game._id}`}
                  className="block rounded-2xl border border-[#232323] bg-[#161616] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <Gamepad2 size={18} className="text-white opacity-70" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{game.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {game.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </MobileLink>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400">No creations yet.</div>
          )}
        </div>
      )}
    </div>
  );
}


