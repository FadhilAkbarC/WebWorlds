'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home as HomeIcon,
  Users,
  MessageSquare,
  Compass,
  UserPlus,
  Heart,
  Play,
} from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import type { Game } from '@/types';

const FRIEND_SLOTS = 12;
const RECENT_LIMIT = 10;
const RECOMMENDED_LIMIT = 12;
const COMMUNITY_LIMIT = 24;

function RailCard({ game }: { game: Game }) {
  const isUnsplash =
    typeof game.thumbnail === 'string' &&
    /(images|plus)\.unsplash\.com/i.test(game.thumbnail);
  const isDataUrl = typeof game.thumbnail === 'string' && game.thumbnail.startsWith('data:image/');
  const likes = game.likes ?? game.stats?.likes ?? 0;
  const plays = game.plays ?? game.stats?.plays ?? 0;

  return (
    <Link href={`/games/${game._id}`} prefetch={false} className="min-w-[170px]">
      <div className="flex flex-col gap-2">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#2a2a2a] border border-[#343434]">
          {game.thumbnail ? (
            <Image
              src={game.thumbnail}
              alt={game.title}
              fill
              sizes="180px"
              loading="lazy"
              unoptimized={isUnsplash || isDataUrl}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/70 text-xs">
              No Image
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white line-clamp-1">
            {game.title}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Heart size={12} /> {likes}
            </span>
            <span className="flex items-center gap-1">
              <Play size={12} /> {plays}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
      <span className="text-xs text-slate-400">→</span>
    </div>
  );
}

export default function Home() {
  const { fetchGames, games, isLoading } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchGames(1, '', '', 50);
  }, [fetchGames]);

  const recent = useMemo(() => games.slice(0, RECENT_LIMIT), [games]);
  const recommended = useMemo(
    () => games.slice(RECENT_LIMIT, RECENT_LIMIT + RECOMMENDED_LIMIT),
    [games]
  );
  const community = useMemo(() => games.slice(0, COMMUNITY_LIMIT), [games]);

  const friendList = useMemo(
    () => Array.from({ length: FRIEND_SLOTS }, (_, i) => `Friend ${i + 1}`),
    []
  );

  return (
    <div className="min-h-screen bg-[#1b1b1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[68px_1fr] gap-5">
          <aside className="hidden lg:flex flex-col gap-3">
            {[HomeIcon, Compass, Users, MessageSquare].map((Icon, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-2xl bg-[#2a2a2a] border border-[#343434] flex items-center justify-center text-slate-300"
              >
                <Icon size={20} />
              </div>
            ))}
          </aside>

          <main className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2a] border border-[#343434] flex items-center justify-center text-slate-300">
                {user?.username?.slice(0, 1) || 'U'}
              </div>
              <div>
                <p className="text-sm text-slate-400">Home</p>
                <p className="text-lg font-semibold text-white">
                  {user?.username || 'Guest'}
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <SectionHeader title={`Friends (${user?.stats?.followers ?? 0})`} />
              <div className="flex gap-3 overflow-x-auto pb-2">
                <Link
                  href="/search?tab=people"
                  prefetch={false}
                  className="min-w-[110px] flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-full bg-[#2a2a2a] border border-[#343434] flex items-center justify-center text-slate-200">
                    <UserPlus size={20} />
                  </div>
                  <p className="text-xs text-slate-400">Add Friends</p>
                </Link>

                {friendList.map((name) => (
                  <div key={name} className="min-w-[110px] flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-[#2a2a2a] border border-[#343434] flex items-center justify-center text-white">
                      {name.slice(0, 1)}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1">{name}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeader title="My Recent" />
              {isLoading ? (
                <div className="flex gap-3 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-[170px] h-[110px] bg-[#2a2a2a] rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {recent.map((game) => (
                    <RailCard key={game._id} game={game} />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <SectionHeader title="Recommended For You" />
              {isLoading ? (
                <div className="flex gap-3 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-[170px] h-[110px] bg-[#2a2a2a] rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {recommended.map((game) => (
                    <RailCard key={game._id} game={game} />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <SectionHeader title="Community Creations" />
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[120px] bg-[#2a2a2a] rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {community.map((game) => (
                    <RailCard key={game._id} game={game} />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
