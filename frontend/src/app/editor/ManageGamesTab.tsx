'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Game } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Trash2, Edit, Eye, Search, Loader2 } from 'lucide-react';

export default function ManageGamesTab() {
  const { user } = useAuthStore();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?._id) fetchGames();
  }, [user?._id]);

  const fetchGames = async () => {
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
    g.title.toLowerCase().includes(search.toLowerCase()) ||
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
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white w-full max-w-xs focus:outline-none focus:border-blue-500"
        />
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" /> Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : filteredGames.length === 0 ? (
        <div className="text-slate-400">No games found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGames.map((game) => (
            <div key={game._id} className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white truncate">{game.title}</h3>
                <span className="text-xs text-slate-400">{game.published ? 'Published' : 'Draft'}</span>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2 mb-2">{game.description || 'No description'}</p>
              <div className="flex gap-4 text-xs text-slate-400 mb-2">
                <span>❤️ {game.likes || 0}</span>
                <span>👁️ {game.plays || 0}</span>
                <span>🗓️ {game.createdAt ? new Date(game.createdAt).toLocaleDateString() : 'Unknown'}</span>
              </div>
              <div className="flex gap-2 mt-auto">
                <Link href={`/games/${game._id}`} className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs flex items-center gap-1"><Eye size={14}/> View</Link>
                <Link href={`/editor?edit=${game._id}`} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs flex items-center gap-1"><Edit size={14}/> Edit</Link>
                <button
                  onClick={() => handleDelete(game._id)}
                  className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs flex items-center gap-1 disabled:opacity-50"
                  disabled={deletingId === game._id}
                >
                  <Trash2 size={14}/>{deletingId === game._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
