import React from 'react';
import AppLink from '@/components/shared/AppLink';
import HomeUserHeader from '@/components/desktop/HomeUserHeader';
import HomeFollowersCount from '@/components/desktop/HomeFollowersCount';
import Image from 'next/image';
import { UserPlus, Heart, Play } from 'lucide-react';
import type { Game } from '@/types';
import { getGamesList } from '@/lib/serverApi';

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
    <AppLink href={`/games/${game._id}`} className="min-w-[170px]">
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
          <p className="text-sm font-semibold text-white line-clamp-1">{game.title}</p>
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
    </AppLink>
  );
}

function SectionHeader({ title }: { title: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
      <span className="text-xs text-slate-400">â†’</span>
    </div>
  );
}

export const revalidate = 30;

export default async function Home() {
  const [recentResponse, recommendedResponse, communityResponse] = await Promise.all([
    getGamesList({
      page: 1,
      limit: RECENT_LIMIT,
      sort: 'newest',
      revalidate: 30,
    }),
    getGamesList({
      page: 1,
      limit: RECOMMENDED_LIMIT,
      sort: 'likes',
      revalidate: 60,
    }),
    getGamesList({
      page: 1,
      limit: COMMUNITY_LIMIT,
      sort: 'trending',
      revalidate: 60,
    }),
  ]);

  const recent = recentResponse.success ? recentResponse.data ?? [] : [];
  const recommendedRaw = recommendedResponse.success ? recommendedResponse.data ?? [] : [];
  const community = communityResponse.success ? communityResponse.data ?? [] : [];
  const recommended =
    recommendedRaw.length > 0 ? recommendedRaw : recent.slice(0, RECOMMENDED_LIMIT);

  const friendList = Array.from({ length: FRIEND_SLOTS }, (_, i) => `Friend ${i + 1}`);
  const recentMessage = recentResponse.success
    ? 'No games yet.'
    : 'Unable to load recent games. Please refresh.';
  const recommendedMessage = recommendedResponse.success
    ? 'No recommendations yet.'
    : 'Unable to load recommendations. Please refresh.';
  const communityMessage = communityResponse.success
    ? 'No community games yet.'
    : 'Unable to load community games. Please refresh.';

  return (
    <div className="min-h-screen bg-[#1b1b1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <main className="space-y-6">
          <HomeUserHeader />

          <section className="space-y-3">
            <SectionHeader
              title={
                <span>
                  Friends (<HomeFollowersCount />)
                </span>
              }
            />
            <div className="flex gap-3 overflow-x-auto pb-2">
              <AppLink
                href="/search?tab=people"
                className="min-w-[110px] flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-[#2a2a2a] border border-[#343434] flex items-center justify-center text-slate-200">
                  <UserPlus size={20} />
                </div>
                <p className="text-xs text-slate-400">Add Friends</p>
              </AppLink>

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
            {recent.length === 0 ? (
              <div className="rounded-lg border border-[#343434] bg-[#232323] px-4 py-3 text-sm text-slate-400">
                {recentMessage}
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
            {recommended.length === 0 ? (
              <div className="rounded-lg border border-[#343434] bg-[#232323] px-4 py-3 text-sm text-slate-400">
                {recommendedMessage}
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
            {community.length === 0 ? (
              <div className="rounded-lg border border-[#343434] bg-[#232323] px-4 py-3 text-sm text-slate-400">
                {communityMessage}
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
  );
}
