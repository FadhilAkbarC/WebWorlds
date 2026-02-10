'use client';

import React, { useEffect, useState } from 'react';
import MobileGameCard from '@/components/mobile/MobileGameCard';
import MobileGameFilter from '@/components/mobile/MobileGameFilter';
import { useGameStore } from '@/stores/gameStore';

const CATEGORIES = ['action', 'adventure', 'puzzle', 'sports', 'other'];
const PAGE_SIZE = 8;

export default function MobileGamesPage() {
  const { games, isLoading, totalCount, page, fetchGames, setPage } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchGames(page, searchQuery, selectedCategory, PAGE_SIZE);
  }, [fetchGames, page, searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="bg-[#0f0f10] px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-white">Games</h1>
        <p className="text-xs text-slate-400">Browse lightweight, fast-loading games.</p>
      </div>

      <MobileGameFilter
        categories={CATEGORIES}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
        onCategoryChange={(category) => {
          setSelectedCategory(category);
          setPage(1);
        }}
      />

      <div className="mt-4 space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#1b1b1b] animate-pulse" />
          ))
        ) : games.length === 0 ? (
          <div className="rounded-2xl border border-[#222] bg-[#141414] p-6 text-center text-sm text-slate-400">
            No games found.
          </div>
        ) : (
          games.map((game) => <MobileGameCard key={game._id} game={game} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-full border border-[#2b2b2b] px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-full border border-[#2b2b2b] px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
