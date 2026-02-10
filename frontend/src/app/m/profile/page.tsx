'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, BadgeCheck, Calendar, Gamepad2, ShieldCheck, Star, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Game } from '@/types';
import AppLink from '@/components/shared/AppLink';

interface Badge {
  name: string;
  description: string;
  earned: boolean;
  icon: React.ReactNode;
}

export default function MobileProfilePage() {
  const { user, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'about' | 'creations'>('about');
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [gamesPage, setGamesPage] = useState(1);
  const [gamesHasMore, setGamesHasMore] = useState(true);

  const fetchUserGames = useCallback(
    async (page = 1, append = false) => {
      if (!user?._id) return;

      try {
        setIsLoadingGames(true);
        const response = await api.get(`/games/creator/${user._id}?page=${page}&limit=8`);
        const data = response.data;
        const items = data.data || [];
        if (append) {
          setUserGames((prev) => [...prev, ...items]);
        } else {
          setUserGames(items);
        }
        setGamesPage(data.pagination?.page || page);
        setGamesHasMore((data.pagination?.page || page) < (data.pagination?.pages || 1));
      } catch (error) {
        console.error('Failed to fetch user games:', error);
        if (!append) setUserGames([]);
      } finally {
        setIsLoadingGames(false);
      }
    },
    [user?._id]
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user?._id) {
      fetchUserGames(1, false);
    }
  }, [fetchUserGames, user?._id]);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  const achievementBadges: Badge[] = useMemo(() => {
    const gamesCreated = user?.stats?.gamesCreated ?? 0;
    const gamesPlayed = user?.stats?.gamesPlayed ?? 0;
    const creations = userGames.length;

    return [
      {
        name: 'Builder',
        description: 'Created your first game',
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
        earned: Boolean(user?.createdAt),
        icon: <Calendar size={14} />,
      },
    ];
  }, [joinedDate, user?.createdAt, user?.stats, userGames.length]);

  const isVerified = Boolean(
    (user as any)?.verified ||
      (user as any)?.isVerified ||
      (user as any)?.badges?.verified
  );

  const isStaff = Boolean(
    (user as any)?.staff ||
      (user as any)?.isStaff ||
      (user as any)?.role === 'staff' ||
      (user as any)?.badges?.staff
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4 text-sm">Please login to view your profile</p>
          <AppLink href="/login" className="text-blue-400 text-sm">
            Go to login
          </AppLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 pt-4">
      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">{user.username[0].toUpperCase()}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white">{user.username}</h1>
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
            <p className="text-white font-semibold">{user.stats?.gamesCreated ?? 0}</p>
            Creations
          </div>
          <div>
            <p className="text-white font-semibold">{user.stats?.gamesPlayed ?? 0}</p>
            Plays
          </div>
          <div>
            <p className="text-white font-semibold">{user.stats?.followers ?? 0}</p>
            Followers
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <AppLink
            href="/profile/edit"
            className="flex-1 rounded-full bg-blue-600 py-2 text-center text-xs font-semibold text-white"
          >
            Edit Profile
          </AppLink>
          <AppLink
            href="/settings"
            className="flex-1 rounded-full border border-[#2b2b2b] py-2 text-center text-xs text-slate-200"
          >
            Settings
          </AppLink>
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
              {user.bio || 'This user has not added an about section yet.'}
            </p>
            <div className="mt-3 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <User size={12} /> Username: {user.username}
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
                <AppLink
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
                </AppLink>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400">No creations yet.</div>
          )}

          {gamesHasMore && (
            <div className="text-center">
              <button
                onClick={() => fetchUserGames(gamesPage + 1, true)}
                className="rounded-full border border-[#2b2b2b] px-4 py-1 text-xs text-slate-300"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
