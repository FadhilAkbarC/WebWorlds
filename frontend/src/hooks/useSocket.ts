import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

/**
 * Global socket instance - shared across components
 * Managed to prevent multiple connections and memory leaks
 */
let globalSocket: Socket | null = null;
let connectionAttempts = 0;

/**
 * Get or create global socket connection
 */
function getOrCreateSocket(): Socket {
  if (globalSocket && globalSocket.connected) {
    return globalSocket;
  }

  if (globalSocket) {
    return globalSocket; // Return existing but disconnected socket
  }

  // Create new connection
  globalSocket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Log connection events in development
  if (process.env.NODE_ENV === 'development') {
    globalSocket.on('connect', () => {
      console.log('[Socket] Connected:', globalSocket?.id);
      connectionAttempts = 0;
    });

    globalSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    globalSocket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });
  }

  return globalSocket;
}

/**
 * Main socket hook - provides direct access to socket instance
 */
export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const socket = getOrCreateSocket();
      socketRef.current = socket;

      // Reconnect with token if authenticated
      if (token && !socket.connected) {
        socket.auth = { token };
        socket.connect();
      }
    } catch (error) {
      console.error('[Socket] Initialization error:', error);
    }

    // Cleanup: Don't disconnect on unmount - keep connection alive for other components
    return () => {
      // Socket will be managed by global instance
    };
  }, [token]);

  return socketRef.current;
};

/**
 * Hook for multiplayer game functionality
 */
export const useMultiplayer = (gameId: string) => {
  const socket = useSocket();
  const gameStateRef = useRef<Record<string, unknown>>({});

  const joinRoom = (roomId: string, playerId: string, playerName: string) => {
    if (!socket) return;

    socket.emit('join-game', {
      roomId,
      userId: playerId,
      playerName,
      gameId,
    });
  };

  const leaveRoom = (roomId: string, userId: string) => {
    if (!socket) return;

    socket.emit('leave-game', {
      roomId,
      userId,
    });
  };

  const updateGameState = (roomId: string, updates: Record<string, unknown>) => {
    if (!socket) return;

    gameStateRef.current = { ...gameStateRef.current, ...updates };
    socket.emit('game-update', {
      roomId,
      state: gameStateRef.current,
      timestamp: Date.now(),
    });
  };

  const sendPlayerAction = (roomId: string, action: Record<string, unknown>) => {
    if (!socket) return;

    socket.emit('player-action', {
      roomId,
      action,
    });
  };

  const updateScore = (roomId: string, userId: string, score: number) => {
    if (!socket) return;

    socket.emit('update-score', {
      roomId,
      userId,
      score,
    });
  };

  const sendChat = (roomId: string, userId: string, message: string, username: string) => {
    if (!socket || message.length === 0 || message.length > 500) return;

    socket.emit('chat', {
      roomId,
      userId,
      message,
      username,
    });
  };

  const onGameStateUpdate = (callback: (state: Record<string, unknown>) => void) => {
    if (!socket) return;

    socket.on('game-state', ({ state }) => {
      gameStateRef.current = state;
      callback(state);
    });

    return () => {
      socket.off('game-state');
    };
  };

  const onPlayerJoined = (callback: (player: { userId: string; playerName: string; playersInRoom: number; timestamp: string }) => void) => {
    if (!socket) return;

    socket.on('player-joined', callback);

    return () => {
      socket.off('player-joined');
    };
  };

  const onPlayerLeft = (callback: (data: { userId: string; playersInRoom: number }) => void) => {
    if (!socket) return;

    socket.on('player-left', callback);

    return () => {
      socket.off('player-left');
    };
  };

  const onScoresUpdated = (callback: (data: { userId: string; score: number; leaderboard: any[] }) => void) => {
    if (!socket) return;

    socket.on('scores-updated', callback);

    return () => {
      socket.off('scores-updated');
    };
  };

  const onChat = (callback: (data: { username: string; message: string; timestamp: string }) => void) => {
    if (!socket) return;

    socket.on('chat', callback);

    return () => {
      socket.off('chat');
    };
  };

  const onRoomState = (callback: (data: { players: any[]; playerCount: number }) => void) => {
    if (!socket) return;

    socket.on('room-state', callback);

    return () => {
      socket.off('room-state');
    };
  };

  return {
    joinRoom,
    leaveRoom,
    updateGameState,
    sendPlayerAction,
    updateScore,
    sendChat,
    onGameStateUpdate,
    onPlayerJoined,
    onPlayerLeft,
    onScoresUpdated,
    onChat,
    onRoomState,
  };
};

/**
 * Disconnect global socket (call on logout)
 */
export const disconnectSocket = () => {
  if (globalSocket && globalSocket.connected) {
    globalSocket.disconnect();
    globalSocket = null;
  }
};

export { socket };
