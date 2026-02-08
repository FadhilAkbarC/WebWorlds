import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from './env';

interface GameRoom {
  players: Map<string, { userId: string; socketId: string; score: number }>;
  gameId: string;
  createdAt: Date;
}

const gameRooms = new Map<string, GameRoom>();

export function setupSocket(httpServer: HTTPServer): SocketIOServer {
  const corsOrigins = process.env.NODE_ENV === 'production' ? 
    (process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || []) : 
    [config.CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:3001'];
  
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1e6, // 1MB max message size
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Middleware: authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // Token validation would go here
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * Join a game room
     */
    socket.on('join-game', (data: { roomId: string; userId: string; playerName: string }) => {
      const { roomId, userId, playerName } = data;
      socket.join(roomId);

      // Get or create room
      if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, {
          players: new Map(),
          gameId: roomId,
          createdAt: new Date(),
        });
      }

      const room = gameRooms.get(roomId)!;
      room.players.set(socket.id, {
        userId,
        socketId: socket.id,
        score: 0,
      });

      // Notify others
      io.to(roomId).emit('player-joined', {
        userId,
        playerName,
        playersInRoom: room.players.size,
        timestamp: new Date(),
      });

      // Send room state to new player
      socket.emit('room-state', {
        players: Array.from(room.players.values()),
        playerCount: room.players.size,
      });

      console.log(`✅ Player ${userId} joined room ${roomId} (${room.players.size} total)`);
    });

    /**
     * Game state update (broadcast to all in room)
     */
    socket.on('game-update', (data: { roomId: string; state: any; timestamp: number }) => {
      const { roomId, state } = data;
      io.to(roomId).emit('game-state', state);
    });

    /**
     * Player action (forward to others)
     */
    socket.on('player-action', (data: { roomId: string; action: any }) => {
      const { roomId, action } = data;
      socket.to(roomId).emit('player-action', action);
    });

    /**
     * Update player score
     */
    socket.on('update-score', (data: { roomId: string; userId: string; score: number }) => {
      const { roomId, userId, score } = data;
      const room = gameRooms.get(roomId);

      if (room) {
        for (const player of room.players.values()) {
          if (player.userId === userId) {
            player.score = score;
          }
        }

        io.to(roomId).emit('scores-updated', {
          userId,
          score,
          leaderboard: Array.from(room.players.values())
            .sort((a, b) => b.score - a.score),
        });
      }
    });

    /**
     * Leave game room
     */
    socket.on('leave-game', (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      socket.leave(roomId);

      const room = gameRooms.get(roomId);
      if (room) {
        room.players.delete(socket.id);

        if (room.players.size === 0) {
          gameRooms.delete(roomId);
          console.log(`🗑️  Room ${roomId} cleaned up (empty)`);
        } else {
          io.to(roomId).emit('player-left', {
            userId,
            playersInRoom: room.players.size,
          });
        }
      }

      console.log(`👋 Player ${userId} left room ${roomId}`);
    });

    /**
     * Chat message
     */
    socket.on('chat', (data: { roomId: string; userId: string; message: string; username: string }) => {
      const { roomId, message, username } = data;
      io.to(roomId).emit('chat', {
        username,
        message,
        timestamp: new Date(),
      });
    });

    /**
     * Disconnect
     */
    socket.on('disconnect', () => {
      // Clean up rooms
      for (const [roomId, room] of gameRooms.entries()) {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);
          if (room.players.size === 0) {
            gameRooms.delete(roomId);
          }
        }
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error(`⚠️  Socket error [${socket.id}]:`, error);
    });
  });

  return io;
}

export default setupSocket;
