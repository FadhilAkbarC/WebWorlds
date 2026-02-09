'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, UsersRound, Globe, Lock } from 'lucide-react';

type Group = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  privacy: 'public' | 'private';
  members: number;
  createdAt: string;
};

const STORAGE_KEY = 'webworlds.groups';

function loadGroups(): Group[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGroups(groups: Group[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    // ignore storage failures
  }
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGroups(loadGroups());
  }, []);

  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    const newGroup: Group = {
      id: `grp_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Community group',
      privacy,
      members: 1,
      createdAt: new Date().toISOString(),
    };
    setGroups((prev) => [newGroup, ...prev]);
    setName('');
    setDescription('');
    setPrivacy('public');
    setError(null);
  };

  const spotlight = useMemo(
    () => [
      { name: 'Builder Squad', members: 1200 },
      { name: 'Speedrunners', members: 860 },
      { name: 'Pixel Artists', members: 540 },
    ],
    []
  );

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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg"
              >
                Create Group
              </button>
            </div>
          </div>

          <div className="bg-[#222] border border-[#2e2e2e] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <UsersRound size={18} />
              <h2 className="text-lg font-semibold">Community Spotlight</h2>
            </div>
            <div className="space-y-3">
              {spotlight.map((group) => (
                <div
                  key={group.name}
                  className="flex items-center justify-between bg-[#2a2a2a] border border-[#343434] rounded-xl px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{group.name}</p>
                    <p className="text-xs text-slate-400">{group.members} members</p>
                  </div>
                  <button className="text-xs text-blue-300">Join</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">My Groups</h2>
          {groups.length === 0 ? (
            <div className="text-sm text-slate-400 bg-[#222] border border-[#2e2e2e] rounded-xl p-4">
              You have no groups yet. Create one above to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
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
                    {group.members} member • {new Date(group.createdAt).toLocaleDateString()}
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
