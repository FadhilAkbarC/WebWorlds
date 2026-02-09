'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameCard } from '@/components/GameCard';
import { GameFilter } from '@/components/GameFilter';
import { useGameStore } from '@/stores/gameStore';
import { Users, Search, UsersRound } from 'lucide-react';

const CATEGORIES = ['action', 'adventure', 'puzzle', 'sports', 'other'];
const TABS = [
  { id: 'games', label: 'Games', icon: Search },
  { id: 'people', label: 'People', icon: Users },
  { id: 'groups', label: 'Groups', icon: UsersRound },
];

function SearchPageClient() {
  const params = useSearchParams();
  const { games, isLoading, totalCount, page, fetchGames, setPage } = useGameStore();
  const [activeTab, setActiveTab] = useState('games');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const tab = params.get('tab');
    const query = params.get('query');
    if (tab && ['games', 'people', 'groups'].includes(tab)) {
      setActiveTab(tab);
    }
    if (query) {
      setSearchQuery(query);
    }
  }, [params]);

  useEffect(() => {
    if (activeTab !== 'games') return;
    fetchGames(page, searchQuery, selectedCategory, 24);
  }, [fetchGames, page, searchQuery, selectedCategory, activeTab]);

  const totalPages = Math.max(1, Math.ceil(totalCount / 24));
  const headerSubtitle = useMemo(() => {
    if (activeTab === 'people') return 'Search users and creators';
    if (activeTab === 'groups') return 'Find groups and communities';
    return 'Browse and discover new games';
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Search</h1>
          <p className="text-slate-400 text-lg">{headerSubtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'games' && (
          <div className="space-y-6">
            <GameFilter
              onSearchChange={(query) => {
                setSearchQuery(query);
                setPage(1);
              }}
              onCategoryChange={(category) => {
                setSelectedCategory(category);
                setPage(1);
              }}
              categories={CATEGORIES}
            />

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-800 rounded-lg aspect-video animate-pulse"
                  />
                ))}
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">No games found</p>
                <p className="text-slate-500">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {games.map((game) => (
                    <GameCard key={game._id} game={game} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-8 border-t border-slate-700">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-slate-400">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'people' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
            <Users size={36} className="text-blue-300 mx-auto" />
            <h2 className="text-xl font-semibold text-white">People Search</h2>
            <p className="text-slate-400 text-sm">
              Search users by name to connect and follow creators. This section will
              reuse the same fast search pipeline as games.
            </p>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
            <UsersRound size={36} className="text-emerald-300 mx-auto" />
            <h2 className="text-xl font-semibold text-white">Group Search</h2>
            <p className="text-slate-400 text-sm">
              Discover groups and communities. Built for quick loading even on slow
              connections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading search...
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
