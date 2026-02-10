'use client';

import { GameCard } from '@/components/desktop/GameCard';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Game } from '@/types';

export default function TrendingPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingGames();
  }, []);

  const fetchTrendingGames = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/games?sort=-plays&limit=12');
      setGames(response.data.games || []);
      setError(null);
    } catch (err) {
      setError('Failed to load trending games');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Trending Games</h1>
          <p className="text-slate-400">The most played games on WebWorlds right now</p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-slate-400">Loading trending games...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {!isLoading && games.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game._id} game={game} />
            ))}
          </div>
        )}

        {!isLoading && games.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No games found yet. Start creating!</p>
          </div>
        )}
      </div>
    </div>
  );
}
