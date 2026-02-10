'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/shared/AppLink';
import dynamic from 'next/dynamic';
import { lazyWithRetry } from '@/lib/lazyWithRetry';
import Image from 'next/image';
import { Play, Heart, Share2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import type { Game } from '@/types';

const CommentsSection = dynamic(
  lazyWithRetry(() =>
    import('@/components/desktop/CommentsSection').then((mod) => ({
      default: mod.CommentsSection,
    }))
  ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-slate-400">
        Loading comments...
      </div>
    ),
  }
);

type GameDetailClientProps = {
  gameId: string;
  initialGame: Game | null;
};

export default function GameDetailClient({ gameId, initialGame }: GameDetailClientProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { likeGame, unlikeGame } = useGameStore();
  const [game, setGame] = useState<Game | null>(initialGame);
  const [isLoading, setIsLoading] = useState(!initialGame);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const fetchGameDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/games/${gameId}`, { timeout: 5000 });
      const gameData = response.data.data || response.data;
      setGame(gameData);
      setError(null);
    } catch (err) {
      setError('Failed to load game details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  const fetchLikeStatus = useCallback(async () => {
    if (!user) return;
    try {
      const likeCheckResponse = await api.get(`/games/${gameId}/like-status`, { timeout: 3000 });
      setIsLiked(Boolean(likeCheckResponse.data?.data?.isLiked));
    } catch {
      setIsLiked(false);
    }
  }, [gameId, user]);

  useEffect(() => {
    if (!gameId) return;
    if (!initialGame) {
      void fetchGameDetail();
    }
  }, [gameId, initialGame, fetchGameDetail]);

  useEffect(() => {
    if (!gameId) return;
    void fetchLikeStatus();
  }, [gameId, fetchLikeStatus]);

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
        setGame((prev) =>
          prev
            ? { ...prev, likes: Math.max(0, (prev.likes ?? prev.stats?.likes ?? 0) - 1) }
            : null
        );
      } else {
        await likeGame(gameId);
        setIsLiked(true);
        setGame((prev) =>
          prev ? { ...prev, likes: (prev.likes ?? prev.stats?.likes ?? 0) + 1 } : null
        );
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
          <AppLink href="/games" className="text-blue-400 hover:text-blue-300 font-semibold">
            Back to games
          </AppLink>
        </div>
      </div>
    );
  }

  const isUnsplash =
    typeof game.thumbnail === 'string' &&
    /(images|plus)\\.unsplash\\.com/i.test(game.thumbnail);

  const plays = game.plays ?? game.stats?.plays ?? 0;
  const likes = game.likes ?? game.stats?.likes ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AppLink href="/games" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          â† Back to Games
        </AppLink>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="w-full aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
              {game.thumbnail ? (
                <Image
                  src={game.thumbnail}
                  alt={game.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  unoptimized={isUnsplash}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                  <Play size={64} className="text-slate-500" />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{game.title}</h1>
              <p className="text-slate-300 text-lg mb-6">{game.description}</p>

              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-2">Plays</div>
                  <div className="text-2xl font-bold text-white">{plays}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-2">Likes</div>
                  <div className="text-2xl font-bold text-white">{likes}</div>
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
                    {game.tags?.length ? (
                      game.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
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

          <div className="space-y-6">
            <button
              onClick={() => gameId && router.push(`/play/${gameId}`)}
              disabled={!gameId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Play size={20} />
              Play Game
            </button>

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
              {isLiked ? 'Liked' : 'Like'} ({likes})
            </button>

            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-colors">
              <Share2 size={20} />
              Share
            </button>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <p className="text-slate-400 text-sm mb-4">Created by</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {typeof game.creator === 'object' && game.creator?.username
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
              <AppLink
                href={`/profile/${typeof game.creator === 'object' ? game.creator?._id : game.creatorId}`}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg text-center transition-colors block"
              >
                View Profile
              </AppLink>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Status</span>
                <span className="text-green-400 font-semibold">
                  {game.featured ? 'â­ Featured' : 'Public'}
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

        <div className="mt-12">
          <CommentsSection gameId={gameId} />
        </div>
      </div>
    </div>
  );
}
