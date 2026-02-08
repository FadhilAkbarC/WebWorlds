import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!socket) {
      socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    socketRef.current = socket;

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  return socketRef.current;
};

export const useMultiplayer = (roomId: string) => {
  const socket = useSocket();
  const gameStateRef = useRef<Record<string, unknown>>({});

  const joinRoom = (playerId: string, playerName: string) => {
    if (socket) {
      socket.emit('join-room', { roomId, playerId, playerName });
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', { roomId });
    }
  };

  const updateGameState = (updates: Record<string, unknown>) => {
    if (socket) {
      gameStateRef.current = { ...gameStateRef.current, ...updates };
      socket.emit('game-state-update', { roomId, state: gameStateRef.current });
    }
  };

  const onGameStateUpdate = (
    callback: (state: Record<string, unknown>) => void
  ) => {
    if (socket) {
      socket.on('game-state-updated', ({ state }) => {
        gameStateRef.current = state;
        callback(state);
      });
    }
  };

  const onPlayerJoined = (
    callback: (player: { id: string; name: string }) => void
  ) => {
    if (socket) {
      socket.on('player-joined', callback);
    }
  };

  const onPlayerLeft = (
    callback: (playerId: string) => void
  ) => {
    if (socket) {
      socket.on('player-left', callback);
    }
  };

  return {
    joinRoom,
    leaveRoom,
    updateGameState,
    onGameStateUpdate,
    onPlayerJoined,
    onPlayerLeft,
  };
};

export { socket };
