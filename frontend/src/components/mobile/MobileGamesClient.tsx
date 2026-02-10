'use client';

import React, { useEffect, useState } from 'react';
import MobileGameCard from '@/components/mobile/MobileGameCard';
import MobileGameFilter from '@/components/mobile/MobileGameFilter';
import { useGameStore } from '@/stores/gameStore';
import type { Game } from '@/types';

const CATEGORIES = ['action', 'adventure', 'puzzle', 'sports', 'other'];
const PAGE_SIZE = 8;

type MobileGamesClientProps = {
  initialGames: Game[];
  initialPage: number;
  initialTotal: number;
  initialSuccess: boolean;
};

export default function MobileGamesClient({
  initialGames,
  initialPage,
  initialTotal,
  initialSuccess,
}: MobileGamesClientProps) {
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
  const hydrateKey = `mobile:games:page:${initialPage}`;

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

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE));
  const showError = !isLoading && (Boolean(error) || (!initialSuccess && games.length === 0));
  const showEmpty = !isLoading && !showError && games.length === 0;

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
        ) : showError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center text-xs text-red-200">
            <p className="mb-3">{error || 'Failed to load games. Try again.'}</p>
            <button
              onClick={() => fetchGames(1, searchQuery, selectedCategory, PAGE_SIZE)}
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : showEmpty ? (
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
