'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameCard } from '@/components/desktop/GameCard';
import { GameFilter } from '@/components/desktop/GameFilter';
import { useGameStore } from '@/stores/gameStore';
import { Users, Search, UsersRound } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Group, UserSearch } from '@/types';

const CATEGORIES = ['action', 'adventure', 'puzzle', 'sports', 'other'];
const TABS = [
  { id: 'games', label: 'Games', icon: Search },
  { id: 'people', label: 'People', icon: Users },
  { id: 'groups', label: 'Groups', icon: UsersRound },
];

function SearchPageClient() {
  const params = useSearchParams();
  const { games, isLoading, totalCount, page, fetchGames, setPage } = useGameStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('games');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [people, setPeople] = useState<UserSearch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

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

  useEffect(() => {
    if (activeTab !== 'people') return;
    const handler = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setPeople([]);
        return;
      }
      setPeopleLoading(true);
      setPeopleError(null);
      try {
        const response = await apiClient.searchUsers({ search: query, page: 1, limit: 24 });
        setPeople(response.data?.data || []);
      } catch (e) {
        setPeopleError('Failed to search people');
      } finally {
        setPeopleLoading(false);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    if (activeTab !== 'groups') return;
    const handler = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setGroups([]);
        return;
      }
      setGroupsLoading(true);
      setGroupsError(null);
      try {
        const response = await apiClient.getGroups({ search: query, page: 1, limit: 24 });
        setGroups(response.data?.data || []);
      } catch (e) {
        setGroupsError('Failed to search groups');
      } finally {
        setGroupsLoading(false);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [activeTab, searchQuery]);

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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            {peopleLoading ? (
              <div className="text-sm text-slate-400">Searching...</div>
            ) : peopleError ? (
              <div className="text-sm text-red-400">{peopleError}</div>
            ) : people.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
                Start typing to find people.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {people.map((person) => (
                  <div
                    key={person._id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm">
                      {person.username?.slice(0, 1).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{person.username}</p>
                      <p className="text-xs text-slate-400">
                        {person.stats?.gamesCreated ?? 0} creations •{' '}
                        {person.stats?.followers ?? 0} followers
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            {groupsLoading ? (
              <div className="text-sm text-slate-400">Searching...</div>
            ) : groupsError ? (
              <div className="text-sm text-red-400">{groupsError}</div>
            ) : groups.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
                Start typing to find groups.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <div
                    key={group._id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{group.name}</p>
                      <button
                        onClick={async () => {
                          if (!user) {
                            setGroupsError('Login required to join groups');
                            return;
                          }
                          setJoiningId(group._id);
                          try {
                            await apiClient.joinGroup(group._id);
                          } finally {
                            setJoiningId(null);
                          }
                        }}
                        disabled={joiningId === group._id || group.isMember}
                        className="text-xs text-blue-300 disabled:opacity-50"
                      >
                        {group.isMember ? 'Joined' : joiningId === group._id ? 'Joining...' : 'Join'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {group.description || 'Community group'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {group.membersCount || 0} members
                    </p>
                  </div>
                ))}
              </div>
            )}
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
