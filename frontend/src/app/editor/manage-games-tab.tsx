'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Game } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import AppLink from '@/components/shared/AppLink';
import { Trash2, Edit, Eye, Search, Loader2, ImagePlus, XCircle } from 'lucide-react';

type IconState = {
  preview?: string;
  value?: string;
  saving?: boolean;
  error?: string;
};

export default function ManageGamesTab() {
  const { user } = useAuthStore();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [iconEdits, setIconEdits] = useState<Record<string, IconState>>({});

  const fetchGames = useCallback(async () => {
    if (!user?._id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/games/creator/${user?._id}?limit=100`);
      setGames(res.data.data || []);
    } catch (e) {
      setError('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    void fetchGames();
  }, [fetchGames]);

  const updateIconState = (id: string, patch: Partial<IconState>) => {
    setIconEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const handleIconFile = (id: string, file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      updateIconState(id, { error: 'File must be an image' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      updateIconState(id, { preview: result, value: result, error: undefined });
    };
    reader.onerror = () => {
      updateIconState(id, { error: 'Failed to read image file' });
    };
    reader.readAsDataURL(file);
  };

  const handleIconUrlChange = (id: string, value: string) => {
    updateIconState(id, { value, preview: value, error: undefined });
  };

  const handleSaveIcon = async (id: string) => {
    const iconValue = iconEdits[id]?.value;
    if (!iconValue) {
      updateIconState(id, { error: 'Select an image or paste a URL' });
      return;
    }
    updateIconState(id, { saving: true, error: undefined });
    try {
      await api.put(`/games/${id}`, { thumbnail: iconValue });
      setGames((prev) =>
        prev.map((g) => (g._id === id ? { ...g, thumbnail: iconValue } : g))
      );
      updateIconState(id, { saving: false });
    } catch (e) {
      updateIconState(id, { saving: false, error: 'Failed to update icon' });
    }
  };

  const handleClearIcon = async (id: string) => {
    updateIconState(id, { saving: true, error: undefined });
    try {
      await api.put(`/games/${id}`, { thumbnail: '' });
      setGames((prev) =>
        prev.map((g) => (g._id === id ? { ...g, thumbnail: '' } : g))
      );
      updateIconState(id, { saving: false, preview: '', value: '' });
    } catch (e) {
      updateIconState(id, { saving: false, error: 'Failed to remove icon' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this game permanently? This cannot be undone!')) return;
    setDeletingId(id);
    try {
      await api.delete(`/games/${id}`);
      setGames((prev) => prev.filter((g) => g._id !== id));
    } catch (e) {
      setError('Failed to delete game');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGames = games.filter((g) =>
    (g.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search my games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white w-full max-w-xs focus:outline-none focus:border-blue-500"
        />
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="animate-spin" /> Loading...
        </div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : filteredGames.length === 0 ? (
        <div className="text-slate-400">No games found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGames.map((game) => {
            const iconState = iconEdits[game._id] || {};
            const likes = game.likes ?? game.stats?.likes ?? 0;
            const plays = game.plays ?? game.stats?.plays ?? 0;
            const preview = iconState.preview || game.thumbnail || '';

            return (
              <div
                key={game._id}
                className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-slate-700 overflow-hidden flex items-center justify-center">
                    {preview ? (
                      <img
                        src={preview}
                        alt={`${game.title} icon`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlus size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-white truncate">{game.title}</h3>
                      <span className="text-xs text-slate-400">
                        {game.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                      {game.description || 'No description'}
                    </p>
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>Likes {likes}</span>
                      <span>Plays {plays}</span>
                      <span>
                        {game.createdAt
                          ? new Date(game.createdAt).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-md border border-slate-700 p-3 space-y-2">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                    Game Icon
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL"
                      value={iconState.value || ''}
                      onChange={(e) => handleIconUrlChange(game._id, e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <label className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs cursor-pointer flex items-center gap-1 justify-center">
                      <ImagePlus size={14} /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleIconFile(game._id, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  {(iconState.value || preview) && (
                    <div className="flex items-center gap-3">
                      {preview && (
                        <img
                          src={preview}
                          alt="Icon preview"
                          className="w-14 h-14 rounded-md object-cover border border-slate-700"
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveIcon(game._id)}
                          disabled={iconState.saving}
                          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs disabled:opacity-60"
                        >
                          {iconState.saving ? 'Saving...' : 'Save Icon'}
                        </button>
                        <button
                          onClick={() => handleClearIcon(game._id)}
                          disabled={iconState.saving}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs disabled:opacity-60 flex items-center gap-1"
                        >
                          <XCircle size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                  {iconState.error && (
                    <p className="text-xs text-red-400">{iconState.error}</p>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <AppLink
                    href={`/games/${game._id}`}
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs flex items-center gap-1"
                  >
                    <Eye size={14} /> View
                  </AppLink>
                  <AppLink
                    href={`/editor?edit=${game._id}`}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs flex items-center gap-1"
                  >
                    <Edit size={14} /> Edit
                  </AppLink>
                  <button
                    onClick={() => handleDelete(game._id)}
                    className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs flex items-center gap-1 disabled:opacity-50"
                    disabled={deletingId === game._id}
                  >
                    <Trash2 size={14} />
                    {deletingId === game._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
