'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Volume2, VolumeX } from 'lucide-react';
import { api } from '@/lib/api';
import { Game } from '@/types';
import { WBWEngine, type WBWError } from '@/engine/WBWEngine';

export default function PlayGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WBWEngine | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wbwErrors, setWbwErrors] = useState<WBWError[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const fetchAndPlayGame = useCallback(async () => {
    if (!gameId) {
      setError('Game ID not provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(`/games/${gameId}`, { timeout: 8000 });
      if (response.data?.success === false) {
        throw new Error(response.data?.error || 'Game not found');
      }
      const gameData = response.data?.data ?? response.data;
      if (!gameData?._id) {
        throw new Error('Game not found');
      }
      setGame(gameData);
      setError(null);
    } catch (err) {
      console.error('Failed to load game:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to load game. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void fetchAndPlayGame();
  }, [fetchAndPlayGame]);

  useEffect(() => {
    if (!game || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = game.settings?.width || 800;
    const height = game.settings?.height || 600;
    const fps = game.settings?.fps || 60;
    const code =
      game.scripts?.find((s) => s.id === 'main')?.code ||
      game.scripts?.[0]?.code ||
      game.code ||
      '';

    const engine = new WBWEngine(canvas, { width, height, fps });
    const result = engine.load(code);
    setWbwErrors(result.errors);

    if (result.errors.length === 0) {
      engine.start();
    } else {
      setError('WBW syntax errors detected. Fix the game code to play.');
    }

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [game]);

  useEffect(() => {
    engineRef.current?.setMuted(isMuted);
  }, [isMuted]);

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
            {wbwErrors.length > 0 && (
              <div className="text-left text-sm text-red-300 max-w-lg mx-auto mb-4 space-y-1">
                {wbwErrors.slice(0, 6).map((err) => (
                  <p key={`${err.line}-${err.message}`}>
                    Line {err.line}: {err.message}
                  </p>
                ))}
                {wbwErrors.length > 6 && (
                  <p>+{wbwErrors.length - 6} more errors...</p>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => fetchAndPlayGame()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Retry
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
              >
                Back
              </button>
            </div>
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
