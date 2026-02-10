'use client';

import React, { useEffect, useState } from 'react';
import { GameCard } from '@/components/desktop/GameCard';
import { GameFilter } from '@/components/desktop/GameFilter';
import { useGameStore } from '@/stores/gameStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Game } from '@/types';

const CATEGORIES = ['action', 'adventure', 'puzzle', 'sports', 'other'];
const PAGE_SIZE = 12;

type GamesClientProps = {
  initialGames: Game[];
  initialPage: number;
  initialTotal: number;
  initialSuccess: boolean;
};

export default function GamesClient({
  initialGames,
  initialPage,
  initialTotal,
  initialSuccess,
}: GamesClientProps) {
  const {
    games,
    isLoading,
    error,
    totalCount,
    page,
    fetchGames,
    setPage,
    hydrateFromServer,
    hydratedKey,
  } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const hydrateKey = `desktop:games:page:${initialPage}`;

  useEffect(() => {
    if (hydratedKey !== hydrateKey) {
      hydrateFromServer({
        key: hydrateKey,
        games: initialGames,
        totalCount: initialTotal,
        page: initialPage,
      });
    }
  }, [
    hydrateFromServer,
    hydrateKey,
    hydratedKey,
    initialGames,
    initialPage,
    initialTotal,
  ]);

  useEffect(() => {
    if (hydratedKey !== hydrateKey) return;

    if (
      initialSuccess &&
      page === initialPage &&
      searchQuery === '' &&
      selectedCategory === ''
    ) {
      return;
    }

    fetchGames(page, searchQuery, selectedCategory, PAGE_SIZE);
  }, [
    fetchGames,
    page,
    searchQuery,
    selectedCategory,
    initialSuccess,
    initialPage,
    hydrateKey,
    hydratedKey,
  ]);

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);
  const showError = !isLoading && (Boolean(error) || (!initialSuccess && games.length === 0));
  const showEmpty = !isLoading && !showError && games.length === 0;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Games
          </h1>
          <p className="text-slate-400 text-lg">
            Browse and play thousands of amazing user-created games
          </p>
        </div>

        <GameFilter
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          categories={CATEGORIES}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800 rounded-lg aspect-video animate-pulse"
              ></div>
            ))}
          </div>
        ) : showError ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-3">
              {error || 'Failed to load games. Please try again.'}
            </p>
            <button
              onClick={() => fetchGames(1, searchQuery, selectedCategory, PAGE_SIZE)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Retry
            </button>
          </div>
        ) : showEmpty ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">No games found</p>
            <p className="text-slate-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {games.map((game) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-700">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded transition-colors ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <span key={pageNum} className="text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
