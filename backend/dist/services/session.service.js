"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionManager = void 0;
const logger_1 = require("../utils/logger");
const ROOM_INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;
class GameSessionManager {
    constructor() {
        this.rooms = new Map();
    }
    initialize() {
        this.cleanupTimer = setInterval(() => {
            this.cleanupInactiveRooms();
        }, CLEANUP_INTERVAL);
        logger_1.logger.info('GameSessionManager initialized');
    }
    getOrCreateRoom(roomId, gameId, maxPlayers) {
        if (this.rooms.has(roomId)) {
            const room = this.rooms.get(roomId);
            room.lastActivity = Date.now();
            return room;
        }
        const room = {
            gameId,
            players: new Map(),
            createdAt: Date.now(),
            lastActivity: Date.now(),
            maxPlayers,
        };
        this.rooms.set(roomId, room);
        logger_1.logger.debug('Game room created', { roomId, gameId });
        return room;
    }
    addPlayer(roomId, player) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        if (room.maxPlayers && room.players.size >= room.maxPlayers) {
            logger_1.logger.warn('Room is full', { roomId, playerCount: room.players.size });
            return false;
        }
        room.players.set(player.socketId, player);
        room.lastActivity = Date.now();
        logger_1.logger.debug('Player added to room', {
            roomId,
            socketId: player.socketId,
            playerCount: room.players.size,
        });
        return true;
    }
    removePlayer(roomId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        if (room.players.has(socketId)) {
            room.players.delete(socketId);
            room.lastActivity = Date.now();
            logger_1.logger.debug('Player removed from room', {
                roomId,
                socketId,
                playerCount: room.players.size,
            });
            if (room.players.size === 0) {
                this.deleteRoom(roomId);
            }
            return true;
        }
        return false;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    getPlayers(roomId) {
        const room = this.rooms.get(roomId);
        return room ? Array.from(room.players.values()) : [];
    }
    updatePlayerScore(roomId, socketId, score) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const player = room.players.get(socketId);
        if (player) {
            player.score = score;
            room.lastActivity = Date.now();
        }
    }
    deleteRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.players.clear();
            this.rooms.delete(roomId);
            logger_1.logger.debug('Game room deleted', { roomId });
        }
    }
    cleanupInactiveRooms() {
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
            logger_1.logger.debug('Cleanup inactive rooms', { deletedCount, remainingRooms: this.rooms.size });
        }
    }
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
    shutdown() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.rooms.clear();
        logger_1.logger.info('GameSessionManager shutdown complete');
    }
}
exports.sessionManager = new GameSessionManager();
//# sourceMappingURL=session.service.js.map