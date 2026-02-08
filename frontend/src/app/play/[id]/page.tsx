'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Volume2, VolumeX } from 'lucide-react';
import { api } from '@/lib/api';
import { Game } from '@/types';

export default function PlayGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!gameId) {
      setError('Game ID not provided');
      setIsLoading(false);
      return;
    }

    const fetchAndPlayGame = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/games/${gameId}`);
        const gameData = response.data.data || response.data;
        setGame(gameData);

        // Execute game code after a brief delay to ensure canvas is ready
        setTimeout(() => {
          executeGameCode(gameData);
        }, 100);
      } catch (err) {
        console.error('Failed to load game:', err);
        setError('Failed to load game. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndPlayGame();
  }, [gameId]);

  const executeGameCode = (gameData: Game) => {
    if (!canvasRef.current) {
      setError('Canvas not available');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setError('Failed to get canvas context');
        return;
      }

      // Create game API for the user code
      const gameAPI = {
        canvas,
        ctx,
        width: canvas.width,
        height: canvas.height,
        drawRect: (x: number, y: number, w: number, h: number, color: string) => {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, w, h);
        },
        drawCircle: (x: number, y: number, r: number, color: string) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        },
        drawText: (
          text: string,
          x: number,
          y: number,
          options?: { color?: string; size?: number; font?: string }
        ) => {
          ctx.fillStyle = options?.color || '#ffffff';
          ctx.font = options?.font || `${options?.size || 16}px Arial`;
          ctx.fillText(text, x, y);
        },
        clearCanvas: (color: string = '#000000') => {
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        },
        input: {
          keys: {} as Record<string, boolean>,
          mouse: { x: 0, y: 0, pressed: false },
        },
      };

      // Setup input handling
      const handleKeyDown = (e: KeyboardEvent) => {
        gameAPI.input.keys[e.key.toLowerCase()] = true;
      };
      const handleKeyUp = (e: KeyboardEvent) => {
        gameAPI.input.keys[e.key.toLowerCase()] = false;
      };
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        gameAPI.input.mouse.x = e.clientX - rect.left;
        gameAPI.input.mouse.y = e.clientY - rect.top;
      };
      const handleMouseDown = () => {
        gameAPI.input.mouse.pressed = true;
      };
      const handleMouseUp = () => {
        gameAPI.input.mouse.pressed = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mouseup', handleMouseUp);

      // Get and execute main code
      const mainScript = gameData.scripts?.find((s) => s.id === 'main');
      const gameCode = mainScript?.code || gameData.code || '';

      // Execute user code with game API available
      // Make sure to use a different variable name to avoid conflicts
      const userCode = `
        (function() {
          // Make gameAPI available as 'game' for user code
          const game = gameAPI;
          ${gameCode}
        }).call(this);
      `;

      // Create and execute the function
      const executeGame = new Function('gameAPI', userCode);
      executeGame(gameAPI);

      // Cleanup on unmount
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mouseup', handleMouseUp);
      };
    } catch (err) {
      console.error('Error executing game code:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {game?.title || 'Playing Game...'}
          </h1>
          {game?.creatorName && (
            <p className="text-slate-400 text-sm">by {game.creatorName}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded hover:bg-slate-800 transition-colors"
          >
            {isMuted ? (
              <VolumeX size={20} className="text-slate-400" />
            ) : (
              <Volume2 size={20} className="text-slate-400" />
            )}
          </button>
          <button
            onClick={() => router.back()}
            className="p-2 rounded hover:bg-slate-800 transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 flex items-center justify-center bg-black p-4 overflow-hidden">
        {isLoading && (
          <div className="text-center">
            <div className="text-slate-400 mb-4">Loading game...</div>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Back to Game
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <canvas
            ref={canvasRef}
            width={game?.settings?.width || 800}
            height={game?.settings?.height || 600}
            className="border border-slate-700 rounded"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        )}
      </div>

      {/* Controls Info */}
      <div className="bg-slate-900 border-t border-slate-700 p-4 text-sm text-slate-400">
        <p>Use keyboard and mouse to control the game. Press ESC to exit.</p>
      </div>
    </div>
  );
}
