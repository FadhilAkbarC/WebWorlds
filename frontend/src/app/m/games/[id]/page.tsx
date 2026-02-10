'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Heart, Share2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { Game } from '@/types';
import MobileLink from '@/components/mobile/MobileLink';
import dynamic from 'next/dynamic';
import { lazyWithRetry } from '@/lib/lazyWithRetry';

const MobileCommentsSection = dynamic(
  lazyWithRetry(() => import('@/components/mobile/MobileCommentsSection')),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-[#232323] bg-[#181818] p-4 text-xs text-slate-400">
        Loading comments...
      </div>
    ),
  }
);

export default function MobileGameDetailPage() {
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

  const fetchGameDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/games/${gameId}`);
      const gameData = response.data.data || response.data;
      setGame(gameData);
      setError(null);

      if (user) {
        try {
          const likeCheckResponse = await api.get(`/games/${gameId}/like-status`);
          setIsLiked(likeCheckResponse.data.isLiked || false);
        } catch {
          setIsLiked(false);
        }
      }
    } catch (err) {
      setError('Failed to load game details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, user]);

  useEffect(() => {
    if (gameId) {
      void fetchGameDetail();
    }
  }, [gameId, fetchGameDetail]);

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
        setGame((prev) => (prev ? { ...prev, likes: Math.max(0, prev.likes - 1) } : null));
      } else {
        await likeGame(gameId);
        setIsLiked(true);
        setGame((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-sm">{error || 'Game not found'}</p>
          <MobileLink href="/games" className="text-blue-400 text-sm">
            Back to games
          </MobileLink>
        </div>
      </div>
    );
  }

  const isUnsplash =
    typeof game.thumbnail === 'string' && /(images|plus)\.unsplash\.com/i.test(game.thumbnail);

  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 pt-4">
      <MobileLink href="/games" className="text-xs text-blue-300">
        ? Back
      </MobileLink>

      <div className="mt-4 space-y-4">
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#1b1b1b]">
          {game.thumbnail ? (
            <Image
              src={game.thumbnail}
              alt={game.title}
              fill
              sizes="100vw"
              unoptimized={isUnsplash}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Play size={36} />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-xl font-semibold text-white">{game.title}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {game.description || 'No description'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/m/play/${gameId}`)}
            className="flex-1 rounded-full bg-blue-600 py-2 text-xs font-semibold"
          >
            <span className="inline-flex items-center gap-2">
              <Play size={14} /> Play
            </span>
          </button>
          <button
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`flex-1 rounded-full border py-2 text-xs font-semibold ${
              isLiked
                ? 'border-red-500/60 text-red-300'
                : 'border-[#2b2b2b] text-slate-300'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} /> {isLiked ? 'Liked' : 'Like'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
          <div className="rounded-xl border border-[#222] bg-[#141414] p-2 text-center">
            <p className="text-white font-semibold">{game.plays || 0}</p>
            <p>Plays</p>
          </div>
          <div className="rounded-xl border border-[#222] bg-[#141414] p-2 text-center">
            <p className="text-white font-semibold">{game.likes || 0}</p>
            <p>Likes</p>
          </div>
          <div className="rounded-xl border border-[#222] bg-[#141414] p-2 text-center">
            <p className="text-white font-semibold">{game.comments || 0}</p>
            <p>Comments</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#232323] bg-[#181818] p-4 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span>Category</span>
            <span className="text-white">{game.category || 'Other'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Updated</span>
            <span className="text-white">
              {game.updatedAt ? new Date(game.updatedAt).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
          <button className="mt-3 w-full rounded-full border border-[#2b2b2b] py-2 text-xs text-slate-300">
            <Share2 size={12} className="inline mr-1" /> Share
          </button>
        </div>

        <MobileCommentsSection gameId={gameId} />
      </div>
    </div>
  );
}


