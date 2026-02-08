"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const auth_1 = __importDefault(require("./routes/auth"));
const games_1 = __importDefault(require("./routes/games"));
const errorHandler_1 = require("./middleware/errorHandler");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.config.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: env_1.config.RATE_LIMIT_WINDOW_MS,
        max: env_1.config.RATE_LIMIT_MAX_REQUESTS,
        message: 'Too many requests, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api/', limiter);
    if (env_1.config.NODE_ENV === 'development') {
        app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
            next();
        });
    }
    app.use('/api/auth', auth_1.default);
    app.use('/api/games', games_1.default);
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: env_1.config.NODE_ENV,
        });
    });
    app.get('/api', (req, res) => {
        res.json({
            name: 'WebWorlds Backend API',
            version: '0.1.0',
            status: 'running',
            environment: env_1.config.NODE_ENV,
            endpoints: {
                auth: {
                    'POST /api/auth/register': 'Register new user',
                    'POST /api/auth/login': 'Login and get JWT token',
                    'GET /api/auth/me': 'Get current user (requires auth)',
                    'GET /api/auth/profile/:id': 'Get user profile',
                },
                games: {
                    'GET /api/games': 'List games (paginated, searchable)',
                    'GET /api/games/:id': 'Get game details',
                    'POST /api/games': 'Create new game (requires auth)',
                    'PUT /api/games/:id': 'Update game (requires auth + ownership)',
                    'DELETE /api/games/:id': 'Delete game (requires auth + ownership)',
                    'POST /api/games/:id/publish': 'Publish game (requires auth + ownership)',
                    'POST /api/games/:id/like': 'Like game (requires auth)',
                    'POST /api/games/:id/unlike': 'Unlike game (requires auth)',
                    'GET /api/games/creator/:creatorId': 'Get creator\'s games',
                },
            },
            websocket: {
                url: 'ws://localhost:5000',
                events: [
                    'join-game',
                    'game-update',
                    'player-action',
                    'update-score',
                    'leave-game',
                    'chat',
                ],
            },
        });
    });
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
exports.default = createApp;
//# sourceMappingURL=app.js.map