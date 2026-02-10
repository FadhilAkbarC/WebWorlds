'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Play } from 'lucide-react';
import { Game } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import MobileLink from '@/components/mobile/MobileLink';

interface MobileGameCardProps {
  game: Game;
}

const MobileGameCard: React.FC<MobileGameCardProps> = ({ game }) => {
  const { user } = useAuthStore();
  const { likeGame, unlikeGame } = useGameStore();
  const [isLiked, setIsLiked] = React.useState(false);

  const isUnsplash =
    typeof game.thumbnail === 'string' && /(images|plus)\.unsplash\.com/i.test(game.thumbnail);
  const isDataUrl = typeof game.thumbnail === 'string' && game.thumbnail.startsWith('data:image/');
  const likes = game.likes ?? game.stats?.likes ?? 0;
  const plays = game.plays ?? game.stats?.plays ?? 0;

  const handleLike = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

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
    <MobileLink href={`/games/${game._id}`} className="block">
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-2xl overflow-hidden">
        <div className="relative w-full aspect-[16/9] bg-[#222]">
          {game.thumbnail ? (
            <Image
              src={game.thumbnail}
              alt={game.title}
              fill
              sizes="100vw"
              unoptimized={isUnsplash || isDataUrl}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Play size={28} />
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white line-clamp-1">{game.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                {game.description || 'No description'}
              </p>
            </div>
            <button
              onClick={handleLike}
              className={`shrink-0 rounded-full border px-2 py-1 text-[10px] ${
                isLiked
                  ? 'border-red-500/60 bg-red-500/10 text-red-300'
                  : 'border-slate-700 text-slate-300'
              }`}
            >
              <Heart size={12} className={isLiked ? 'text-red-400' : 'text-slate-400'} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Play size={12} /> {plays}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} /> {likes}
            </span>
          </div>
        </div>
      </div>
    </MobileLink>
  );
};

export default MobileGameCard;

