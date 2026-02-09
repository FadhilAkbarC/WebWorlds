'use client';

import React, { useEffect, useState } from 'react';
import { GameCard } from '@/components/GameCard';
import { GameFilter } from '@/components/GameFilter';
import { useGameStore } from '@/stores/gameStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = ['Action', 'Adventure', 'Puzzle', 'Sports', 'Casual', 'Strategy', 'Multiplayer'];

export default function GamesPage() {
  const { games, isLoading, totalCount, page, fetchGames, setPage } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchGames(page, searchQuery, selectedCategory);
  }, [fetchGames, page, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(totalCount / 12);

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
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Games
          </h1>
          <p className="text-slate-400 text-lg">
            Browse and play thousands of amazing user-created games
          </p>
        </div>

        {/* Filter */}
        <GameFilter
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          categories={CATEGORIES}
        />

        {/* Games Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800 rounded-lg aspect-video animate-pulse"
              ></div>
            ))}
          </div>
        ) : games.length === 0 ? (
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

            {/* Pagination */}
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
