import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from './env';
import { sessionManager } from '../services';
import { logger } from '../utils/logger';

export function setupSocket(httpServer: HTTPServer): SocketIOServer {
  // Parse allowed origins from environment (comma-separated)
  // Must match Express CORS configuration
  const allowedOrigins = config.CORS_ORIGIN
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  // Validate CORS_ORIGIN is not empty
  if (allowedOrigins.length === 0) {
    logger.error(
      '❌ CRITICAL: CORS_ORIGIN is empty for Socket.io! ' +
        'Set environment variable: CORS_ORIGIN=https://your-frontend-domain.com'
    );
    if (config.IS_PRODUCTION) {
      process.exit(1);
    }
  }

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`⚠️  Socket.io CORS rejected: ${origin}`, { 
            allowedOrigins,
            hint: 'Update CORS_ORIGIN environment variable if domain is legitimate',
          });
          callback(new Error('CORS not allowed'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1e6, // 1MB max message size
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Initialize session manager for cleanup
  sessionManager.initialize();

  // Middleware: authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // Token validation would go here
    next();
  });

  io.on('connection', (socket: Socket) => {
    logger.debug('Socket connected', { socketId: socket.id });

    /**
     * Join a game room
     */
    socket.on('join-game', (data: { roomId: string; userId: string; playerName: string; gameId: string; maxPlayers?: number }) => {
      const { roomId, userId, playerName, gameId, maxPlayers } = data;
      socket.join(roomId);

      // Get or create room via session manager
      const room = sessionManager.getOrCreateRoom(roomId, gameId, maxPlayers);

      // Add player
      const playerAdded = sessionManager.addPlayer(roomId, {
        userId,
        socketId: socket.id,
        playerName,
        score: 0,
        connected: true,
      });

      if (!playerAdded) {
        logger.warn('Failed to add player - room full', { roomId, playerId: userId });
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      // Notify all players in room
      const roomPlayers = sessionManager.getPlayers(roomId);
      io.to(roomId).emit('player-joined', {
        userId,
        playerName,
        playersInRoom: roomPlayers.length,
        timestamp: new Date().toISOString(),
      });

      // Send room state to new player
      socket.emit('room-state', {
        players: roomPlayers,
        playerCount: roomPlayers.length,
      });

      logger.debug('Player joined room', {
        roomId,
        userId,
        playerCount: roomPlayers.length,
      });
    });

    /**
     * Game state update (broadcast to all in room)
     */
    socket.on('game-update', (data: { roomId: string; state: Record<string, any> }) => {
      const { roomId, state } = data;
      io.to(roomId).emit('game-state', state);
    });

    /**
     * Player action (forward to others in room)
     */
    socket.on('player-action', (data: { roomId: string; action: Record<string, any> }) => {
      const { roomId, action } = data;
      socket.to(roomId).emit('player-action', action);
    });

    /**
     * Update player score
     */
    socket.on('update-score', (data: { roomId: string; userId: string; score: number }) => {
      const { roomId, userId, score } = data;
      sessionManager.updatePlayerScore(roomId, socket.id, score);

      const roomPlayers = sessionManager.getPlayers(roomId);
      io.to(roomId).emit('scores-updated', {
        userId,
        score,
        leaderboard: roomPlayers.sort((a, b) => b.score - a.score),
      });
    });

    /**
     * Leave game room explicitly
     */
    socket.on('leave-game', (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      socket.leave(roomId);

      sessionManager.removePlayer(roomId, socket.id);
      const remainingPlayers = sessionManager.getPlayers(roomId);

      if (remainingPlayers.length > 0) {
        io.to(roomId).emit('player-left', {
          userId,
          playersInRoom: remainingPlayers.length,
        });
      }

      logger.debug('Player left room', {
        roomId,
        userId,
        remainingPlayers: remainingPlayers.length,
      });
    });

    /**
     * Chat message
     */
    socket.on('chat', (data: { roomId: string; userId: string; message: string; username: string }) => {
      const { roomId, userId, message, username } = data;

      // Validate message length
      if (!message || message.length > 500) {
        logger.warn('Invalid chat message', { roomId, userId });
        return;
      }

      io.to(roomId).emit('chat', {
        username,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      // Try to find and remove player from all rooms
      const rooms = io.sockets.adapter.rooms;
      for (const roomId of rooms.keys()) {
        sessionManager.removePlayer(roomId, socket.id);
      }

      logger.debug('Socket disconnected', { socketId: socket.id });
    });

    /**
     * Error handler
     */
    socket.on('error', (error) => {
      logger.error('Socket error', error, { socketId: socket.id });
    });
  });

  // Graceful shutdown handler
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down session manager');
    sessionManager.shutdown();
  });

  return io;
}

export default setupSocket;
