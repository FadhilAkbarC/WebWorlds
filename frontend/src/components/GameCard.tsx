'use client';

import React from 'react';
import { Game } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Play, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { user } = useAuthStore();
  const { likeGame, unlikeGame } = useGameStore();
  const [isLiked, setIsLiked] = React.useState(false);
  const isUnsplash =
    typeof game.thumbnail === 'string' &&
    /(images|plus)\.unsplash\.com/i.test(game.thumbnail);
  const isDataUrl = typeof game.thumbnail === 'string' && game.thumbnail.startsWith('data:image/');
  const likes = game.likes ?? game.stats?.likes ?? 0;
  const plays = game.plays ?? game.stats?.plays ?? 0;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please login to like games');
      return;
    }

    try {
      if (isLiked) {
        await unlikeGame(game._id);
        setIsLiked(false);
      } else {
        await likeGame(game._id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  return (
    <Link href={`/games/${game._id}`}>
      <div className="group bg-slate-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:scale-105">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-slate-700 overflow-hidden">
          {game.thumbnail ? (
            <Image
              src={game.thumbnail}
              alt={game.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              priority={Boolean(game.featured)}
              unoptimized={isUnsplash || isDataUrl}
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Play size={48} className="text-white opacity-50" />
            </div>
          )}

          {/* Featured Badge */}
          {game.featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
              Featured
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all">
            <Play size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="font-bold text-lg text-white line-clamp-2 mb-2">
            {game.title}
          </h3>

          <p className="text-sm text-slate-400 line-clamp-2 mb-3">
            {game.description || 'No description available'}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {game.category && (
              <span className="text-xs bg-slate-700 text-blue-300 px-2 py-1 rounded">
                {game.category}
              </span>
            )}
            {game.tags && game.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-700 text-purple-300 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-slate-400 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Play size={14} />
                <span>{plays}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart
                  size={14}
                  fill={isLiked ? 'currentColor' : 'none'}
                  className={isLiked ? 'text-red-500' : ''}
                />
                <span>{likes}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <User size={14} />
              <span className="text-xs truncate max-w-24">{game.creatorName || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Like Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLike}
            className={`w-full py-2 rounded transition-colors font-medium text-sm flex items-center justify-center gap-2 ${
              isLiked
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            {isLiked ? 'Liked' : 'Like'}
          </button>
        </div>
      </div>
    </Link>
  );
};
