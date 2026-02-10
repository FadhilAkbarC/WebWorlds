'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Volume2, VolumeX } from 'lucide-react';
import { api } from '@/lib/api';
import { Game } from '@/types';
import { WBWEngine, type WBWError } from '@/engine/WBWEngine';

export default function MobilePlayGamePage() {
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
        setError(null);
      } catch (err) {
        console.error('Failed to load game:', err);
        setError('Failed to load game. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndPlayGame();
  }, [gameId]);

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
    <div className="w-full min-h-screen bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div>
          <p className="text-xs text-slate-400">Now playing</p>
          <h1 className="text-sm font-semibold text-white">
            {game?.title || 'Loading...'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-slate-900"
          >
            {isMuted ? (
              <VolumeX size={18} className="text-slate-300" />
            ) : (
              <Volume2 size={18} className="text-slate-300" />
            )}
          </button>
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-slate-900"
          >
            <X size={18} className="text-slate-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-black p-3">
        {isLoading && (
          <div className="text-center">
            <div className="text-slate-400 mb-4 text-sm">Loading game...</div>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {error && (
          <div className="text-center text-sm">
            <p className="text-red-400 mb-4">{error}</p>
            {wbwErrors.length > 0 && (
              <div className="text-left text-xs text-red-300 max-w-xs mx-auto mb-4 space-y-1">
                {wbwErrors.slice(0, 4).map((err) => (
                  <p key={`${err.line}-${err.message}`}>
                    Line {err.line}: {err.message}
                  </p>
                ))}
              </div>
            )}
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
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
            className="border border-slate-800 rounded"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        )}
      </div>
    </div>
  );
}


