import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { logger } from './utils/logger';
import authRoutes from './routes/auth';
import gameRoutes from './routes/games';
import commentRoutes from './routes/comments';
import activityRoutes from './routes/activities';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  // ============ Security Middleware ============
  app.use(helmet());

  // ============ CORS Configuration ============
  // Parse allowed origins from environment (comma-separated)
  const allowedOrigins = config.CORS_ORIGIN
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl requests)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // Log rejected CORS attempts in production
          if (config.IS_PRODUCTION) {
            logger.warn(`CORS Rejected: ${origin}`, { allowedOrigins });
          }
          callback(new Error(`CORS not allowed for origin: ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400, // Cache preflight for 24 hours
      optionsSuccessStatus: 200, // For legacy browsers
    })
  );

  // ============ Body Parsing ============
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // ============ Rate Limiting ============
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // ============ Request Logging ============
  if (config.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  // ============ API Routes ============
  app.use('/api/auth', authRoutes);
  app.use('/api/games', gameRoutes);
  app.use('/api', commentRoutes);
  app.use('/api', activityRoutes);

  // ============ Health Check ============
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    });
  });

  // ============ API Documentation ============
  app.get('/api', (req, res) => {
    res.json({
      name: 'WebWorlds Backend API',
      version: '0.1.0',
      status: 'running',
      environment: config.NODE_ENV,
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

  // ============ Error Handling ============
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
