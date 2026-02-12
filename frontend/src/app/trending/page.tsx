import { GameCard } from '@/components/desktop/GameCard';
import { getTrendingGames } from '@/lib/server-api-client';

export const revalidate = 45;

export default async function TrendingPage() {
  const response = await getTrendingGames(12, 45);
  const games = response.success ? response.data ?? [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Trending Games</h1>
          <p className="text-slate-400">The most played games on WebWorlds right now</p>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No games found yet. Start creating!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}