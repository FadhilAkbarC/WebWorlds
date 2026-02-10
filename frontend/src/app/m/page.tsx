import React from 'react';
import { Sparkles, ArrowRight, Gamepad2 } from 'lucide-react';
import MobileGameCard from '@/components/mobile/MobileGameCard';
import MobileLink from '@/components/mobile/MobileLink';
import MobileHomeHero from '@/components/mobile/MobileHomeHero';
import { getGamesList } from '@/lib/serverApi';

const HOME_LIMIT = 16;

export const revalidate = 30;

export default async function MobileHomePage() {
  const response = await getGamesList({
    page: 1,
    limit: HOME_LIMIT,
    revalidate: 30,
  });
  const games = response.success ? response.data ?? [] : [];
  const fetchFailed = !response.success;
  const emptyMessage = fetchFailed
    ? 'Unable to load games. Pull to refresh.'
    : 'No games yet.';

  const featured = games.slice(0, 4);
  const more = games.slice(4, 12);

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
        {featured.length === 0 ? (
          <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 text-xs text-slate-400">
            {emptyMessage}
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
        {more.length === 0 ? (
          <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 text-xs text-slate-400">
            {emptyMessage}
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
