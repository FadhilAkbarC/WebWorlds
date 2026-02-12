'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, Search, UsersRound } from 'lucide-react';
import MobileGameCard from '@/components/mobile/MobileGameCard';
import MobileGameFilter from '@/components/mobile/MobileGameFilter';
import { useGameStore } from '@/stores/gameStore';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import type { Group, UserSearch } from '@/types';

const CATEGORIES = ['action', 'adventure', 'puzzle', 'sports', 'other'];
const TABS = [
  { id: 'games', label: 'Games', icon: Search },
  { id: 'people', label: 'People', icon: Users },
  { id: 'groups', label: 'Groups', icon: UsersRound },
];

function MobileSearchClient() {
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
    fetchGames(page, searchQuery, selectedCategory, 12);
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
        const response = await apiClient.searchUsers({ search: query, page: 1, limit: 12 });
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
        const response = await apiClient.getGroups({ search: query, page: 1, limit: 12 });
        setGroups(response.data?.data || []);
      } catch (e) {
        setGroupsError('Failed to search groups');
      } finally {
        setGroupsLoading(false);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalCount / 12));
  const headerSubtitle = useMemo(() => {
    if (activeTab === 'people') return 'Search creators and friends';
    if (activeTab === 'groups') return 'Find communities';
    return 'Discover new games fast';
  }, [activeTab]);

  return (
    <div className="bg-[#0f0f10] px-4 pt-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-white">Search</h1>
        <p className="text-xs text-slate-400">{headerSubtitle}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                isActive
                  ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                  : 'border-[#2b2b2b] bg-[#171717] text-slate-400'
              }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'games' && (
        <div className="mt-4 space-y-3">
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

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-[#1b1b1b] animate-pulse" />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="rounded-2xl border border-[#222] bg-[#141414] p-6 text-center text-sm text-slate-400">
              No games found.
            </div>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <MobileGameCard key={game._id} game={game} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-400">
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
      )}

      {activeTab === 'people' && (
        <div className="mt-4 space-y-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people"
            className="w-full rounded-2xl border border-[#2b2b2b] bg-[#141414] px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          {peopleLoading ? (
            <div className="text-xs text-slate-400">Searching...</div>
          ) : peopleError ? (
            <div className="text-xs text-red-400">{peopleError}</div>
          ) : people.length === 0 ? (
            <div className="rounded-2xl border border-[#222] bg-[#141414] p-6 text-center text-xs text-slate-400">
              Start typing to find people.
            </div>
          ) : (
            <div className="space-y-2">
              {people.map((person) => (
                <div
                  key={person._id}
                  className="rounded-2xl border border-[#222] bg-[#141414] p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white text-xs">
                    {person.username?.slice(0, 1).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{person.username}</p>
                    <p className="text-[11px] text-slate-400">
                      {person.stats?.gamesCreated ?? 0} creations � {person.stats?.followers ?? 0} followers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="mt-4 space-y-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups"
            className="w-full rounded-2xl border border-[#2b2b2b] bg-[#141414] px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          {groupsLoading ? (
            <div className="text-xs text-slate-400">Searching...</div>
          ) : groupsError ? (
            <div className="text-xs text-red-400">{groupsError}</div>
          ) : groups.length === 0 ? (
            <div className="rounded-2xl border border-[#222] bg-[#141414] p-6 text-center text-xs text-slate-400">
              Start typing to find groups.
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group._id}
                  className="rounded-2xl border border-[#222] bg-[#141414] p-3"
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
                      className="text-[11px] text-blue-300 disabled:opacity-50"
                    >
                      {group.isMember ? 'Joined' : joiningId === group._id ? 'Joining...' : 'Join'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {group.description || 'Community group'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {group.membersCount || 0} members
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MobileSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center text-slate-400">
          Loading search...
        </div>
      }
    >
      <MobileSearchClient />
    </Suspense>
  );
}


