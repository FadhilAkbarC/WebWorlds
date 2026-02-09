/**
 * Game Session Manager for Socket.io
 * Handles room management with automatic cleanup to prevent memory leaks
 */

import { logger } from '../utils/logger';

export interface Player {
  userId: string;
  socketId: string;
  playerName: string;
  score: number;
  connected: boolean;
}

export interface GameRoom {
  gameId: string;
  players: Map<string, Player>;
  createdAt: number;
  lastActivity: number;
  maxPlayers?: number;
}

const ROOM_INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

class GameSessionManager {
  private rooms = new Map<string, GameRoom>();
  private cleanupTimer?: NodeJS.Timeout;

  /**
   * Initialize cleanup routine
   */
  initialize(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupInactiveRooms();
    }, CLEANUP_INTERVAL);

    logger.info('GameSessionManager initialized');
  }

  /**
   * Create or get game room
   */
  getOrCreateRoom(roomId: string, gameId: string, maxPlayers?: number): GameRoom {
    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId)!;
      room.lastActivity = Date.now();
      return room;
    }

    const room: GameRoom = {
      gameId,
      players: new Map(),
      createdAt: Date.now(),
      lastActivity: Date.now(),
      maxPlayers,
    };

    this.rooms.set(roomId, room);
    logger.debug('Game room created', { roomId, gameId });
    return room;
  }

  /**
   * Add player to room
   */
  addPlayer(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    if (room.maxPlayers && room.players.size >= room.maxPlayers) {
      logger.warn('Room is full', { roomId, playerCount: room.players.size });
      return false;
    }

    room.players.set(player.socketId, player);
    room.lastActivity = Date.now();

    logger.debug('Player added to room', {
      roomId,
      socketId: player.socketId,
      playerCount: room.players.size,
    });

    return true;
  }

  /**
   * Remove player from room
   */
  removePlayer(roomId: string, socketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    if (room.players.has(socketId)) {
      room.players.delete(socketId);
      room.lastActivity = Date.now();

      logger.debug('Player removed from room', {
        roomId,
        socketId,
        playerCount: room.players.size,
      });

      // Delete room if empty
      if (room.players.size === 0) {
        this.deleteRoom(roomId);
      }

      return true;
    }

    return false;
  }

  /**
   * Get room
   */
  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get all players in room
   */
  getPlayers(roomId: string): Player[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.players.values()) : [];
  }

  /**
   * Update player score
   */
  updatePlayerScore(roomId: string, socketId: string, score: number): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socketId);
    if (player) {
      player.score = score;
      room.lastActivity = Date.now();
    }
  }

  /**
   * Delete room explicitly
   */
  private deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players.clear();
      this.rooms.delete(roomId);
      logger.debug('Game room deleted', { roomId });
    }
  }

  /**
   * Clean up inactive rooms to prevent memory leak
   */
  private cleanupInactiveRooms(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      const inactivityTime = now - room.lastActivity;

      if (inactivityTime > ROOM_INACTIVITY_TIMEOUT) {
        this.deleteRoom(roomId);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.debug('Cleanup inactive rooms', { deletedCount, remainingRooms: this.rooms.size });
    }
  }

  /**
   * Get session stats for monitoring
   */
  getStats() {
    let totalPlayers = 0;
    for (const room of this.rooms.values()) {
      totalPlayers += room.players.size;
    }

    return {
      activeRooms: this.rooms.size,
      totalPlayers,
      memory: process.memoryUsage().heapUsed,
    };
  }

  /**
   * Shutdown - cleanup resources
   */
  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.rooms.clear();
    logger.info('GameSessionManager shutdown complete');
  }
}

export const sessionManager = new GameSessionManager();
