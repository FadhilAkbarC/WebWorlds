"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
const env_1 = require("./env");
const services_1 = require("../services");
const logger_1 = require("../utils/logger");
function setupSocket(httpServer) {
    const allowedOrigins = env_1.config.CORS_ORIGIN
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
    if (allowedOrigins.length === 0) {
        logger_1.logger.error('❌ CRITICAL: CORS_ORIGIN is empty for Socket.io! ' +
            'Set environment variable: CORS_ORIGIN=https://your-frontend-domain.com');
        if (env_1.config.IS_PRODUCTION) {
            process.exit(1);
        }
    }
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    logger_1.logger.warn(`⚠️  Socket.io CORS rejected: ${origin}`, {
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
        maxHttpBufferSize: 1e6,
        pingInterval: 25000,
        pingTimeout: 20000,
    });
    services_1.sessionManager.initialize();
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        next();
    });
    io.on('connection', (socket) => {
        logger_1.logger.debug('Socket connected', { socketId: socket.id });
        socket.on('join-game', (data) => {
            const { roomId, userId, playerName, gameId, maxPlayers } = data;
            socket.join(roomId);
            const room = services_1.sessionManager.getOrCreateRoom(roomId, gameId, maxPlayers);
            const playerAdded = services_1.sessionManager.addPlayer(roomId, {
                userId,
                socketId: socket.id,
                playerName,
                score: 0,
                connected: true,
            });
            if (!playerAdded) {
                logger_1.logger.warn('Failed to add player - room full', { roomId, playerId: userId });
                socket.emit('error', { message: 'Room is full' });
                return;
            }
            const roomPlayers = services_1.sessionManager.getPlayers(roomId);
            io.to(roomId).emit('player-joined', {
                userId,
                playerName,
                playersInRoom: roomPlayers.length,
                timestamp: new Date().toISOString(),
            });
            socket.emit('room-state', {
                players: roomPlayers,
                playerCount: roomPlayers.length,
            });
            logger_1.logger.debug('Player joined room', {
                roomId,
                userId,
                playerCount: roomPlayers.length,
            });
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
            services_1.sessionManager.updatePlayerScore(roomId, socket.id, score);
            const roomPlayers = services_1.sessionManager.getPlayers(roomId);
            io.to(roomId).emit('scores-updated', {
                userId,
                score,
                leaderboard: roomPlayers.sort((a, b) => b.score - a.score),
            });
        });
        socket.on('leave-game', (data) => {
            const { roomId, userId } = data;
            socket.leave(roomId);
            services_1.sessionManager.removePlayer(roomId, socket.id);
            const remainingPlayers = services_1.sessionManager.getPlayers(roomId);
            if (remainingPlayers.length > 0) {
                io.to(roomId).emit('player-left', {
                    userId,
                    playersInRoom: remainingPlayers.length,
                });
            }
            logger_1.logger.debug('Player left room', {
                roomId,
                userId,
                remainingPlayers: remainingPlayers.length,
            });
        });
        socket.on('chat', (data) => {
            const { roomId, userId, message, username } = data;
            if (!message || message.length > 500) {
                logger_1.logger.warn('Invalid chat message', { roomId, userId });
                return;
            }
            io.to(roomId).emit('chat', {
                username,
                message,
                timestamp: new Date().toISOString(),
            });
        });
        socket.on('disconnect', () => {
            const rooms = io.sockets.adapter.rooms;
            for (const roomId of rooms.keys()) {
                services_1.sessionManager.removePlayer(roomId, socket.id);
            }
            logger_1.logger.debug('Socket disconnected', { socketId: socket.id });
        });
        socket.on('error', (error) => {
            logger_1.logger.error('Socket error', error, { socketId: socket.id });
        });
    });
    process.on('SIGTERM', () => {
        logger_1.logger.info('SIGTERM received, shutting down session manager');
        services_1.sessionManager.shutdown();
    });
    return io;
}
exports.default = setupSocket;
//# sourceMappingURL=socket.js.map