'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Heart, Share2, User, MessageSquare, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { Game } from '@/types';
import { CommentsSection } from '@/components/CommentsSection';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { user } = useAuthStore();
  const { likeGame, unlikeGame } = useGameStore();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (gameId) {
      fetchGameDetail();
    }
  }, [gameId]);

  const fetchGameDetail = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/games/${gameId}`);
      const gameData = response.data.data || response.data;
      setGame(gameData);
      setError(null);
      
      // Check if user liked this game
      if (user) {
        try {
          const likeCheckResponse = await api.get(`/games/${gameId}/like-status`);
          setIsLiked(likeCheckResponse.data.isLiked || false);
        } catch {
          // Endpoint might not exist, skip
          setIsLiked(false);
        }
      }
    } catch (err) {
      setError('Failed to load game details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      alert('Please login to like games');
      return;
    }

    setIsLiking(true);
    try {
      if (isLiked) {
        await unlikeGame(gameId);
        setIsLiked(false);
        setGame(prev => prev ? { ...prev, likes: Math.max(0, prev.likes - 1) } : null);
      } else {
        await likeGame(gameId);
        setIsLiked(true);
        setGame(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Game not found'}</p>
          <Link href="/games" className="text-blue-400 hover:text-blue-300 font-semibold">
            Back to games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/games" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Games
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Thumbnail */}
            <div className="w-full aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              {game.thumbnail ? (
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                  <Play size={64} className="text-slate-500" />
                </div>
              )}
            </div>

            {/* Title and Meta */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{game.title}</h1>
              <p className="text-slate-300 text-lg mb-6">{game.description}</p>

              {/* Game Meta */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-2">Plays</div>
                  <div className="text-2xl font-bold text-white">{game.plays || 0}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-2">Likes</div>
                  <div className="text-2xl font-bold text-white">{game.likes || 0}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-2">Rating</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {game.rating ? game.rating.toFixed(1) : 'N/A'}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-2">Comments</div>
                  <div className="text-2xl font-bold text-white">{game.comments || 0}</div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">About This Game</h2>
              <div className="space-y-4 text-slate-300">
              <div>
                  <p className="text-sm text-slate-400 mb-1">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {game.category ? (
                      <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">
                        {game.category}
                      </span>
                    ) : (
                      <span className="text-slate-500">Not specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {game.tags?.length ? game.tags.map((tag) => (
                      <span key={tag} className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    )) : (
                      <span className="text-slate-500">No tags</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Published</p>
                  <p>{game.createdAt ? new Date(game.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Play Button */}
            <button
              onClick={() => gameId && router.push(`/play/${gameId}`)}
              disabled={!gameId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Play size={20} />
              Play Game
            </button>

            {/* Like Button */}
            <button
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`w-full py-2 rounded transition-colors font-medium text-sm flex items-center justify-center gap-2 ${
                isLiked
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              {isLiked ? 'Liked' : 'Like'} ({game.likes || 0})
            </button>

            {/* Share Button */}
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-colors">
              <Share2 size={20} />
              Share
            </button>

            {/* Creator Card */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <p className="text-slate-400 text-sm mb-4">Created by</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {(typeof game.creator === 'object' && game.creator?.username)
                      ? game.creator.username[0].toUpperCase()
                      : '?'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {typeof game.creator === 'object' ? game.creator?.username : 'Unknown'}
                  </p>
                </div>
              </div>
              <Link
                href={`/profile/${typeof game.creator === 'object' ? game.creator?._id : game.creatorId}`}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-center transition-colors block"
              >
                View Profile
              </Link>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                {isLiked ? 'Liked' : 'Like'}
              </button>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-colors">
                <Share2 size={20} />
                Share
              </button>
            </div>

            {/* Stats */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Status</span>
                <span className="text-green-400 font-semibold">
                  {game.featured ? '⭐ Featured' : 'Public'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Version</span>
                <span className="text-white font-semibold">v{game.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Last Updated</span>
                <span className="text-white font-semibold">
                  {game.updatedAt ? new Date(game.updatedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentsSection gameId={gameId} />
        </div>
      </div>
    </div>
  );
}
