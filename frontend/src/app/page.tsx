'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Users, UserPlus, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import type { Game } from '@/types';

const RECOMMENDED_LIMIT = 10;
const RECENT_LIMIT = 8;
const COMMUNITY_LIMIT = 24;

function SmallGameCard({ game }: { game: Game }) {
  const isUnsplash =
    typeof game.thumbnail === 'string' &&
    /(images|plus)\.unsplash\.com/i.test(game.thumbnail);
  const isDataUrl = typeof game.thumbnail === 'string' && game.thumbnail.startsWith('data:image/');

  return (
    <Link href={`/games/${game._id}`} prefetch={false}>
      <div className="group flex flex-col gap-2 min-w-[180px] max-w-[200px]">
        <div className="relative w-full aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          {game.thumbnail ? (
            <Image
              src={game.thumbnail}
              alt={game.title}
              fill
              sizes="200px"
              loading="lazy"
              unoptimized={isUnsplash || isDataUrl}
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-slate-900 flex items-center justify-center text-white text-sm font-semibold">
              {game.title?.slice(0, 1) || 'G'}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white line-clamp-1">{game.title}</p>
          <p className="text-xs text-slate-400 line-clamp-1">
            {game.creatorName || 'Unknown Creator'}
          </p>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          prefetch={false}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          See all <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { fetchGames, games, isLoading } = useGameStore();
  const { user } = useAuthStore();
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    fetchGames(1, '', '', 36);
  }, [fetchGames]);

  const recommended = useMemo(() => games.slice(0, RECOMMENDED_LIMIT), [games]);
  const recent = useMemo(
    () => games.slice(RECOMMENDED_LIMIT, RECOMMENDED_LIMIT + RECENT_LIMIT),
    [games]
  );
  const community = useMemo(() => games.slice(0, COMMUNITY_LIMIT), [games]);

  const friendPlaceholders = useMemo(
    () => Array.from({ length: 6 }, (_, i) => `Friend ${i + 1}`),
    []
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.2fr_1fr] gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                <User className="text-slate-300" size={28} />
              </div>
              <div>
                <p className="text-white font-bold text-lg">
                  {user?.username || 'Guest'}
                </p>
                <p className="text-slate-400 text-sm">
                  {user ? 'Welcome back to WebWorlds' : 'Sign in to personalize'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-white font-bold">
                  {user?.stats?.gamesCreated ?? 0}
                </p>
                <p className="text-xs text-slate-400">Creations</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-white font-bold">
                  {user?.stats?.gamesPlayed ?? 0}
                </p>
                <p className="text-xs text-slate-400">Played</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-white font-bold">
                  {user?.stats?.followers ?? 0}
                </p>
                <p className="text-xs text-slate-400">Friends</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={user ? '/profile' : '/login'}
                className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg py-2"
              >
                {user ? 'View Profile' : 'Login to Continue'}
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Users size={20} className="text-blue-300" />
              <h3 className="text-white font-semibold">Friends</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {friendPlaceholders.map((name) => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-2 bg-slate-800 rounded-xl p-3"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                    {name.slice(0, 1)}
                  </div>
                  <p className="text-xs text-slate-300 text-center line-clamp-1">
                    {user ? name : 'Add Friend'}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/search?tab=people"
                prefetch={false}
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                Find friends <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <UserPlus size={20} className="text-emerald-300" />
              <h3 className="text-white font-semibold">Add Friends</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Search people or communities to connect.
            </p>
            <div className="flex gap-2">
              <input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search usernames"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <Link
                href={`/search?tab=people&query=${encodeURIComponent(searchName)}`}
                prefetch={false}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-lg"
              >
                Search
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Clock size={14} /> Suggestion updates fast even on slow networks.
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            title="Recommended"
            subtitle="Fast picks based on what players like"
            href="/search"
          />
          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-[180px] h-[140px] bg-slate-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recommended.map((game) => (
                <SmallGameCard key={game._id} game={game} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionHeader
            title="Recently Played"
            subtitle={user ? 'Pick up where you left off' : 'Login to track your history'}
            href="/search"
          />
          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-[180px] h-[140px] bg-slate-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recent.map((game) => (
                <SmallGameCard key={game._id} game={game} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionHeader
            title="Community Creations"
            subtitle="Discover new games from the community"
            href="/search"
          />
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-[140px] bg-slate-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {community.map((game) => (
                <SmallGameCard key={game._id} game={game} />
              ))}
            </div>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles size={22} className="text-yellow-300" />
            <div>
              <h3 className="text-white font-semibold">Build and publish in minutes</h3>
              <p className="text-sm text-slate-400">
                Optimized for slow networks and low-end devices.
              </p>
            </div>
          </div>
          <Link
            href="/editor"
            className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2 rounded-lg"
          >
            Create a Game
          </Link>
        </section>
      </div>
    </div>
  );
}
