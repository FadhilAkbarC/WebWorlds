"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
const env_1 = require("./env");
const gameRooms = new Map();
function setupSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.config.CORS_ORIGIN,
            credentials: true,
            methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'],
        maxHttpBufferSize: 1e6,
        pingInterval: 25000,
        pingTimeout: 20000,
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        next();
    });
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socket.on('join-game', (data) => {
            const { roomId, userId, playerName } = data;
            socket.join(roomId);
            if (!gameRooms.has(roomId)) {
                gameRooms.set(roomId, {
                    players: new Map(),
                    gameId: roomId,
                    createdAt: new Date(),
                });
            }
            const room = gameRooms.get(roomId);
            room.players.set(socket.id, {
                userId,
                socketId: socket.id,
                score: 0,
            });
            io.to(roomId).emit('player-joined', {
                userId,
                playerName,
                playersInRoom: room.players.size,
                timestamp: new Date(),
            });
            socket.emit('room-state', {
                players: Array.from(room.players.values()),
                playerCount: room.players.size,
            });
            console.log(`✅ Player ${userId} joined room ${roomId} (${room.players.size} total)`);
        });
        socket.on('game-update', (data) => {
            const { roomId, state } = data;
            io.to(roomId).emit('game-state', state);
        });
        socket.on('player-action', (data) => {
            const { roomId, action } = data;
            socket.to(roomId).emit('player-action', action);
        });
        socket.on('update-score', (data) => {
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
        socket.on('leave-game', (data) => {
            const { roomId, userId } = data;
            socket.leave(roomId);
            const room = gameRooms.get(roomId);
            if (room) {
                room.players.delete(socket.id);
                if (room.players.size === 0) {
                    gameRooms.delete(roomId);
                    console.log(`🗑️  Room ${roomId} cleaned up (empty)`);
                }
                else {
                    io.to(roomId).emit('player-left', {
                        userId,
                        playersInRoom: room.players.size,
                    });
                }
            }
            console.log(`👋 Player ${userId} left room ${roomId}`);
        });
        socket.on('chat', (data) => {
            const { roomId, message, username } = data;
            io.to(roomId).emit('chat', {
                username,
                message,
                timestamp: new Date(),
            });
        });
        socket.on('disconnect', () => {
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
exports.default = setupSocket;
//# sourceMappingURL=socket.js.map