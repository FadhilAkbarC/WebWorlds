import MobileGameCard from '@/components/mobile/MobileGameCard';
import { getTrendingGames } from '@/lib/server-api-client';

export const revalidate = 45;

export default async function MobileTrendingPage() {
  const response = await getTrendingGames(10, 45);
  const games = response.success ? response.data ?? [] : [];

  return (
    <div className="bg-[#0f0f10] px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-white">Trending</h1>
        <p className="text-xs text-slate-400">Most played right now.</p>
      </div>

      {games.length > 0 ? (
        <div className="space-y-3">
          {games.map((game) => (
            <MobileGameCard key={game._id} game={game} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#232323] bg-[#161616] p-4 text-xs text-slate-400">
          No games found yet. Start creating!
        </div>
      )}
    </div>
  );
}