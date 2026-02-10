'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Game } from '@/types';
import MobileGameCard from '@/components/mobile/MobileGameCard';

export default function MobileTrendingPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingGames = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/games?sort=-plays&limit=10');
        setGames(response.data.games || []);
        setError(null);
      } catch (err) {
        setError('Failed to load trending games');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingGames();
  }, []);

  return (
    <div className="bg-[#0f0f10] px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-white">Trending</h1>
        <p className="text-xs text-slate-400">Most played right now.</p>
      </div>

      {isLoading && <div className="text-xs text-slate-400">Loading trending games...</div>}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
          {error}
        </div>
      )}

      {!isLoading && games.length > 0 && (
        <div className="space-y-3">
          {games.map((game) => (
            <MobileGameCard key={game._id} game={game} />
          ))}
        </div>
      )}

      {!isLoading && games.length === 0 && !error && (
        <div className="rounded-xl border border-[#232323] bg-[#161616] p-4 text-xs text-slate-400">
          No games found yet. Start creating!
        </div>
      )}
    </div>
  );
}
