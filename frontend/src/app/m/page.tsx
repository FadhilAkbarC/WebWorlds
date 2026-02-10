'use client';

import React, { useEffect, useMemo } from 'react';
import { Sparkles, ArrowRight, Gamepad2 } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import MobileGameCard from '@/components/mobile/MobileGameCard';
import AppLink from '@/components/shared/AppLink';

const HOME_LIMIT = 16;

export default function MobileHomePage() {
  const { fetchGames, games, isLoading } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchGames(1, '', '', HOME_LIMIT);
  }, [fetchGames]);

  const featured = useMemo(() => games.slice(0, 4), [games]);
  const more = useMemo(() => games.slice(4, 12), [games]);

  return (
    <div className="bg-[#0f0f10] px-4 pt-4">
      <div className="mb-4 rounded-2xl border border-[#222] bg-gradient-to-br from-blue-600/20 via-[#151515] to-[#111] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Welcome back</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          {user?.username ? `Hi ${user.username}` : 'Discover new worlds'}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Fast loads, lighter UI, and instant play.
        </p>
        <div className="mt-4 flex gap-3">
          <AppLink
            href="/games"
            className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-center text-xs font-semibold"
          >
            Browse games
          </AppLink>
          <AppLink
            href="/editor"
            className="flex-1 rounded-full border border-blue-500/50 px-4 py-2 text-center text-xs font-semibold text-blue-200"
          >
            Create
          </AppLink>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-blue-300" /> Trending now
          </h2>
          <AppLink href="/games" className="text-xs text-blue-300 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </AppLink>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-[#1b1b1b] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {featured.map((game) => (
              <MobileGameCard key={game._id} game={game} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Gamepad2 size={14} className="text-purple-300" /> Fresh picks
          </h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-[#1b1b1b] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {more.map((game) => (
              <MobileGameCard key={game._id} game={game} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
