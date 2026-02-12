import React from 'react';
import { Sparkles, ArrowRight, Gamepad2 } from 'lucide-react';
import MobileGameCard from '@/components/mobile/MobileGameCard';
import MobileLink from '@/components/mobile/MobileLink';
import MobileHomeHero from '@/components/mobile/MobileHomeHero';
import { getGamesList } from '@/lib/server-api-client';

const HOME_LIMIT = 12;

export const revalidate = 30;

export default async function MobileHomePage() {
  const [trendingResponse, freshResponse] = await Promise.all([
    getGamesList({
      page: 1,
      limit: 4,
      sort: 'trending',
      revalidate: 60,
    }),
    getGamesList({
      page: 1,
      limit: HOME_LIMIT,
      sort: 'newest',
      revalidate: 30,
    }),
  ]);

  const trending = trendingResponse.success ? trendingResponse.data ?? [] : [];
  const fresh = freshResponse.success ? freshResponse.data ?? [] : [];
  const trendingMessage = trendingResponse.success
    ? 'No trending games yet.'
    : 'Unable to load trending games. Pull to refresh.';
  const freshMessage = freshResponse.success
    ? 'No fresh games yet.'
    : 'Unable to load games. Pull to refresh.';

  return (
    <div className="bg-[#0f0f10] px-4 pt-4">
      <MobileHomeHero />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-blue-300" /> Trending now
          </h2>
          <MobileLink href="/games" className="text-xs text-blue-300 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </MobileLink>
        </div>
        {trending.length === 0 ? (
          <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 text-xs text-slate-400">
            {trendingMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {trending.map((game) => (
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
        {fresh.length === 0 ? (
          <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 text-xs text-slate-400">
            {freshMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {fresh.map((game) => (
              <MobileGameCard key={game._id} game={game} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
