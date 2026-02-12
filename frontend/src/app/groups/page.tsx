'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PlusCircle, UsersRound, Globe, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import type { Group } from '@/types';

export default function GroupsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getGroups({ page: 1, limit: 30 });
      const data = response.data?.data || [];
      setGroups(data);
    } catch (e) {
      setError('Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyGroups = useCallback(async () => {
    if (!user) {
      setMyGroups([]);
      return;
    }
    try {
      const response = await apiClient.getMyGroups();
      setMyGroups(response.data?.data || []);
    } catch {
      setMyGroups([]);
    }
  }, [user]);

  useEffect(() => {
    void fetchGroups();
    void fetchMyGroups();
  }, [fetchGroups, fetchMyGroups]);

  const handleCreate = async () => {
    if (!user) {
      setError('Login required to create a group');
      return;
    }
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      await apiClient.createGroup({
        name: name.trim(),
        description: description.trim(),
        privacy,
      });
      setName('');
      setDescription('');
      setPrivacy('public');
      await fetchGroups();
      await fetchMyGroups();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    if (!user) {
      setError('Login required to join groups');
      return;
    }
    setJoiningId(groupId);
    try {
      await apiClient.joinGroup(groupId);
      await fetchGroups();
      await fetchMyGroups();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to join group');
    } finally {
      setJoiningId(null);
    }
  };

  const spotlight = useMemo(() => {
    const sorted = [...groups].sort(
      (a, b) => (b.membersCount || 0) - (a.membersCount || 0)
    );
    return sorted.slice(0, 3);
  }, [groups]);

  return (
    <div className="min-h-screen bg-[#1b1b1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Groups</h1>
          <p className="text-sm text-slate-400">
            Create and grow communities for free. Fast, lightweight, and ready for any device.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="bg-[#222] border border-[#2e2e2e] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <PlusCircle size={18} />
              <h2 className="text-lg font-semibold">Create a Group</h2>
              <span className="ml-auto text-xs text-emerald-400">Free</span>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name"
                className="w-full bg-[#2a2a2a] border border-[#343434] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                rows={3}
                className="w-full bg-[#2a2a2a] border border-[#343434] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={privacy === 'public'}
                    onChange={() => setPrivacy('public')}
                  />
                  <Globe size={14} /> Public
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={privacy === 'private'}
                    onChange={() => setPrivacy('private')}
                  />
                  <Lock size={14} /> Private
                </label>
              </div>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg"
              >
                {isCreating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>

          <div className="bg-[#222] border border-[#2e2e2e] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <UsersRound size={18} />
              <h2 className="text-lg font-semibold">Community Spotlight</h2>
            </div>
            <div className="space-y-3">
              {spotlight.length === 0 ? (
                <div className="text-xs text-slate-400">No groups yet.</div>
              ) : (
                spotlight.map((group) => (
                  <div
                    key={group._id}
                    className="flex items-center justify-between bg-[#2a2a2a] border border-[#343434] rounded-xl px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{group.name}</p>
                      <p className="text-xs text-slate-400">
                        {group.membersCount || 0} members
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoin(group._id)}
                      disabled={joiningId === group._id || group.isMember}
                      className="text-xs text-blue-300 disabled:opacity-50"
                    >
                      {group.isMember ? 'Joined' : joiningId === group._id ? 'Joining...' : 'Join'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">My Groups</h2>
          {isLoading ? (
            <div className="text-sm text-slate-400 bg-[#222] border border-[#2e2e2e] rounded-xl p-4">
              Loading groups...
            </div>
          ) : myGroups.length === 0 ? (
            <div className="text-sm text-slate-400 bg-[#222] border border-[#2e2e2e] rounded-xl p-4">
              You have no groups yet. Create one above to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <div
                  key={group._id}
                  className="bg-[#222] border border-[#2e2e2e] rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{group.name}</p>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {group.privacy}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{group.description}</p>
                  <p className="text-[11px] text-slate-500">
                    {group.membersCount || 0} member • {group.createdAt
                      ? new Date(group.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
