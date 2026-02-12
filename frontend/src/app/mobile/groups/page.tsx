'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PlusCircle, UsersRound, Globe, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import type { Group } from '@/types';

export default function MobileGroupsPage() {
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
      const response = await apiClient.getGroups({ page: 1, limit: 20 });
      setGroups(response.data?.data || []);
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
    <div className="bg-[#0f0f10] px-4 pt-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Groups</h1>
        <p className="text-xs text-slate-400">Build communities on mobile.</p>
      </div>

      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 space-y-3">
        <div className="flex items-center gap-2 text-white">
          <PlusCircle size={16} />
          <h2 className="text-sm font-semibold">Create a Group</h2>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          className="w-full rounded-xl border border-[#2b2b2b] bg-[#121212] px-3 py-2 text-xs text-white"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          rows={3}
          className="w-full rounded-xl border border-[#2b2b2b] bg-[#121212] px-3 py-2 text-xs text-white"
        />
        <div className="flex gap-3 text-xs text-slate-300">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={privacy === 'public'}
              onChange={() => setPrivacy('public')}
            />
            <Globe size={12} /> Public
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={privacy === 'private'}
              onChange={() => setPrivacy('private')}
            />
            <Lock size={12} /> Private
          </label>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full rounded-full bg-blue-600 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isCreating ? 'Creating...' : 'Create Group'}
        </button>
      </div>

      <div className="rounded-2xl border border-[#232323] bg-[#161616] p-4 space-y-2">
        <div className="flex items-center gap-2 text-white">
          <UsersRound size={16} />
          <h2 className="text-sm font-semibold">Spotlight</h2>
        </div>
        {spotlight.length === 0 ? (
          <div className="text-xs text-slate-400">No groups yet.</div>
        ) : (
          spotlight.map((group) => (
            <div
              key={group._id}
              className="flex items-center justify-between rounded-xl border border-[#2b2b2b] bg-[#121212] px-3 py-2"
            >
              <div>
                <p className="text-xs font-semibold text-white">{group.name}</p>
                <p className="text-[10px] text-slate-400">
                  {group.membersCount || 0} members
                </p>
              </div>
              <button
                onClick={() => handleJoin(group._id)}
                disabled={joiningId === group._id || group.isMember}
                className="text-[10px] text-blue-300 disabled:opacity-50"
              >
                {group.isMember ? 'Joined' : joiningId === group._id ? 'Joining...' : 'Join'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-white">My Groups</h2>
        {isLoading ? (
          <div className="rounded-xl border border-[#232323] bg-[#161616] p-4 text-xs text-slate-400">
            Loading groups...
          </div>
        ) : myGroups.length === 0 ? (
          <div className="rounded-xl border border-[#232323] bg-[#161616] p-4 text-xs text-slate-400">
            You have no groups yet.
          </div>
        ) : (
          <div className="space-y-2">
            {myGroups.map((group) => (
              <div
                key={group._id}
                className="rounded-xl border border-[#232323] bg-[#161616] p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">{group.name}</p>
                  <span className="text-[10px] text-slate-400 uppercase">{group.privacy}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {group.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


