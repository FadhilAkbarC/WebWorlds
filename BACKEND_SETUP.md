# 🚀 WebWorlds Backend Setup - Complete Tutorial

## 📋 Overview

This guide walks you through creating a production-ready backend for WebWorlds using:
- **Express.js** - Lightweight web framework
- **MongoDB** - Scalable NoSQL database
- **Socket.io** - Real-time multiplayer
- **Railway** - $5/month hosting (free tier available)
- **JWT** - Stateless authentication

**Performance Targets:**
- API responses: <100ms (p95)
- WebSocket latency: <50ms
- Memory usage: <100MB
- Database queries: Indexed (all O(1) or O(log n))

---

## 🎯 Phase 1: Local Development Setup

### Step 1: Initialize Backend Project

```bash
cd c:\Users\fadhi\WebWorlds
mkdir backend
cd backend
npm init -y
```

### Step 2: Install Dependencies (Optimized for Performance)

```bash
npm install \
  express@4.21.0 \
  mongoose@8.1.0 \
  jsonwebtoken@9.1.2 \
  bcryptjs@2.4.3 \
  socket.io@4.7.0 \
  cors@2.8.5 \
  helmet@7.1.0 \
  dotenv@16.3.1 \
  express-rate-limit@7.1.5 \
  --save

npm install \
  nodemon@3.1.0 \
  typescript@5.3.3 \
  @types/express@4.17.21 \
  @types/node@20.10.6 \
  ts-node@10.9.2 \
  --save-dev
```

**Why these versions?**
- Express 4.21: Latest stable, security patches
- Mongoose 8.1: Latest with better performance
- JWT: Stateless auth, no session store needed
- Socket.io 4.7: Latest with engine.io improvements
- Helmet: Security headers (lightweight)
- Rate limiting: DDoS protection

### Step 3: Create package.json Scripts

Add to `backend/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Run tests here\"",
    "migrate": "ts-node src/scripts/migrate.ts"
  }
}
```

---

## 🏗️ Phase 2: Project Structure

Create this structure in `backend/`:

```
backend/
├── src/
│   ├── server.ts              # Entry point
│   ├── app.ts                 # Express app setup
│   ├── config/
│   │   ├── database.ts        # MongoDB connection
│   │   ├── socket.ts          # Socket.io setup
│   │   └── env.ts             # Environment validation
│   ├── models/
│   │   ├── User.ts            # User schema
│   │   ├── Game.ts            # Game schema
│   │   ├── GameSession.ts     # Play session tracking
│   │   ├── Leaderboard.ts     # Scores
│   │   └── index.ts           # Export all models
│   ├── routes/
│   │   ├── auth.ts            # Login, register, JWT
│   │   ├── games.ts           # Game CRUD, search
│   │   ├── users.ts           # Profile, stats
│   │   ├── sessions.ts        # Game play tracking
│   │   └── index.ts           # Router setup
│   ├── controllers/
│   │   ├── authController.ts  # Auth logic
│   │   ├── gameController.ts  # Game logic
│   │   ├── userController.ts  # User logic
│   │   └── sessionController.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification
│   │   ├── errorHandler.ts    # Error handling
│   │   ├── validation.ts      # Input validation
│   │   └── cache.ts           # Response caching
│   ├── utils/
│   │   ├── jwt.ts             # JWT helpers
│   │   ├── errors.ts          # Custom errors
│   │   ├── validators.ts      # Validation rules
│   │   └── logger.ts          # Logging
│   ├── sockets/
│   │   ├── gameSocket.ts      # Multiplayer logic
│   │   └── handlers.ts        # Socket event handlers
│   └── scripts/
│       └── migrate.ts         # Database init
│
├── .env.example
├── .env.local                 # (local only, not in git)
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

---

## 💾 Phase 3: Database Models

### 3.1 User Model

**File: `backend/src/models/User.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  bio?: string;
  avatar?: string;
  createdGames: mongoose.Types.ObjectId[];
  likedGames: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  stats: {
    gamesCreated: number;
    gamesPlayed: number;
    followers: number;
    totalPlaytime: number; // seconds
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      lowercase: true,
      match: /^[a-z0-9_-]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Don't return by default
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    avatar: String,
    createdGames: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
      },
    ],
    likedGames: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    stats: {
      gamesCreated: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      totalPlaytime: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  plainPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Create indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.gamesPlayed': -1 }); // For leaderboards

export const User = mongoose.model<IUser>('User', userSchema);
```

### 3.2 Game Model

**File: `backend/src/models/Game.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  creator: mongoose.Types.ObjectId; // User
  code: string;
  scripts: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  assets: Array<{
    id: string;
    name: string;
    type: string; // 'image', 'sound', 'json'
    url: string;
  }>;
  settings: {
    width: number;
    height: number;
    fps: number;
    maxPlayers?: number;
    isMultiplayer: boolean;
  };
  stats: {
    plays: number;
    likes: number;
    averageRating: number;
    totalRatings: number;
  };
  tags: string[];
  category: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    thumbnail: String,
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      default: '// Game code here',
    },
    scripts: [
      {
        id: String,
        name: String,
        code: String,
      },
    ],
    assets: [
      {
        id: String,
        name: String,
        type: String,
        url: String,
      },
    ],
    settings: {
      width: { type: Number, default: 800 },
      height: { type: Number, default: 600 },
      fps: { type: Number, default: 60 },
      maxPlayers: Number,
      isMultiplayer: { type: Boolean, default: false },
    },
    stats: {
      plays: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
    },
    tags: [String],
    category: {
      type: String,
      enum: ['action', 'puzzle', 'adventure', 'sports', 'other'],
      default: 'other',
    },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
gameSchema.index({ creator: 1 });
gameSchema.index({ createdAt: -1 });
gameSchema.index({ 'stats.plays': -1 });
gameSchema.index({ 'stats.likes': -1 });
gameSchema.index({ category: 1 });
gameSchema.index({ tags: 1 });
gameSchema.index({ published: 1 });

export const Game = mongoose.model<IGame>('Game', gameSchema);
```

### 3.3 GameSession Model (for tracking plays)

**File: `backend/src/models/GameSession.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IGameSession extends Document {
  game: mongoose.Types.ObjectId; // Game
  player: mongoose.Types.ObjectId; // User
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  score?: number;
  createdAt: Date;
}

const gameSessionSchema = new Schema<IGameSession>(
  {
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    player: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      default: () => new Date(),
    },
    endTime: Date,
    duration: { type: Number, default: 0 },
    score: Number,
  },
  { timestamps: true }
);

// Indexes
gameSessionSchema.index({ game: 1, createdAt: -1 });
gameSessionSchema.index({ player: 1, createdAt: -1 });

export const GameSession = mongoose.model<IGameSession>(
  'GameSession',
  gameSessionSchema
);
```

### 3.4 Leaderboard Model

**File: `backend/src/models/Leaderboard.ts`**

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaderboardEntry extends Document {
  game: mongoose.Types.ObjectId;
  player: mongoose.Types.ObjectId;
  score: number;
  rank: number;
  updatedAt: Date;
}

const leaderboardSchema = new Schema<ILeaderboardEntry>(
  {
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    player: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
  },
  { timestamps: true }
);

// Compound index for faster leaderboard queries
leaderboardSchema.index({ game: 1, rank: 1 });
leaderboardSchema.index({ player: 1, game: 1 }, { unique: true });

export const Leaderboard = mongoose.model<ILeaderboardEntry>(
  'Leaderboard',
  leaderboardSchema
);
```

### 3.5 Export Models

**File: `backend/src/models/index.ts`**

```typescript
export { User, type IUser } from './User';
export { Game, type IGame } from './Game';
export { GameSession, type IGameSession } from './GameSession';
export { Leaderboard, type ILeaderboardEntry } from './Leaderboard';
```

---

## 🔐 Phase 4: Configuration

### 4.1 Environment Variables

**File: `backend/.env.example`**

```env
# Server
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/webworlds
MONGODB_TEST_URI=mongodb://localhost:27017/webworlds-test

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

### 4.2 TypeScript Config

**File: `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4.3 Database Connection

**File: `backend/src/config/database.ts`**

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/webworlds';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
```

### 4.4 Environment Validation

**File: `backend/src/config/env.ts`**

```typescript
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

export const config = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: parseInt(getEnv('PORT', '5000'), 10),
  HOST: getEnv('HOST', 'localhost'),
  MONGODB_URI: getEnv('MONGODB_URI'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRY: getEnv('JWT_EXPIRY', '7d'),
  CORS_ORIGIN: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
};
```

---

## 🛡️ Phase 5: Middleware

### 5.1 JWT Authentication

**File: `backend/src/middleware/auth.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRY,
  });
}
```

### 5.2 Error Handler

**File: `backend/src/middleware/errorHandler.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
```

### 5.3 Input Validation

**File: `backend/src/middleware/validation.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUsername(username: string): boolean {
  return /^[a-z0-9_-]{3,30}$/.test(username);
}

export function validatePassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password);
}

export const validators = {
  email: validateEmail,
  username: validateUsername,
  password: validatePassword,
};
```

---

## 🚀 Phase 6: API Routes & Controllers

### 6.1 Auth Controller

**File: `backend/src/controllers/authController.ts`**

```typescript
import { Response } from 'express';
import { User } from '../models';
import { generateToken } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { validators } from '../middleware/validation';
import { AuthRequest } from '../middleware/auth';

export const authController = {
  // Register
  register: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { username, email, password } = req.body;

    // Validation
    if (!validators.username(username)) {
      throw new AppError(400, 'Invalid username format');
    }
    if (!validators.email(email)) {
      throw new AppError(400, 'Invalid email format');
    }
    if (!validators.password(password)) {
      throw new AppError(
        400,
        'Password must be 8+ chars with uppercase, lowercase, and number'
      );
    }

    // Check if exists
    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existing) {
      throw new AppError(409, 'User already exists');
    }

    // Create user
    const user = new User({ username, email, passwordHash: password });
    await user.save();

    const token = generateToken(user._id.toString());
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  }),

  // Login
  login: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = generateToken(user._id.toString());
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  }),

  // Get current user
  me: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    res.json(user);
  }),
};
```

### 6.2 Game Controller

**File: `backend/src/controllers/gameController.ts`**

```typescript
import { Response } from 'express';
import { Game } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const gameController = {
  // List games with pagination, search, filter
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { published: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = category;
    }

    // Execute queries in parallel
    const [games, total] = await Promise.all([
      Game.find(query)
        .populate('creator', 'username avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Game.countDocuments(query),
    ]);

    res.json({
      data: games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }),

  // Get single game
  get: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const game = await Game.findById(id).populate('creator', 'username avatar');
    if (!game) {
      throw new AppError(404, 'Game not found');
    }
    res.json(game);
  }),

  // Create game (drafts)
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, code } = req.body;

    const game = new Game({
      title,
      description,
      code,
      creator: req.userId,
      published: false,
    });
    await game.save();
    res.status(201).json(game);
  }),

  // Update game
  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    // Check ownership
    if (game.creator.toString() !== req.userId) {
      throw new AppError(403, 'Not authorized');
    }

    Object.assign(game, req.body);
    await game.save();
    res.json(game);
  }),

  // Publish game
  publish: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    if (game.creator.toString() !== req.userId) {
      throw new AppError(403, 'Not authorized');
    }

    game.published = true;
    await game.save();
    res.json(game);
  }),

  // Like game
  like: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const game = await Game.findByIdAndUpdate(
      id,
      {
        $inc: { 'stats.likes': 1 },
      },
      { new: true }
    );
    res.json(game);
  }),

  // Unlike game - implement similar pattern
  unlike: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const game = await Game.findByIdAndUpdate(
      id,
      {
        $inc: { 'stats.likes': -1 },
      },
      { new: true }
    );
    res.json(game);
  }),
};
```

### 6.3 Auth Routes

**File: `backend/src/routes/auth.ts`**

```typescript
import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);

export default router;
```

### 6.4 Game Routes

**File: `backend/src/routes/games.ts`**

```typescript
import { Router } from 'express';
import { gameController } from '../controllers/gameController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', gameController.list);
router.get('/:id', gameController.get);
router.post('/', authenticateToken, gameController.create);
router.put('/:id', authenticateToken, gameController.update);
router.post('/:id/publish', authenticateToken, gameController.publish);
router.post('/:id/like', authenticateToken, gameController.like);
router.post('/:id/unlike', authenticateToken, gameController.unlike);

export default router;
```

---

## 📡 Phase 7: Socket.io Setup

### 7.1 Socket.io Configuration

**File: `backend/src/config/socket.ts`**

```typescript
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from './env';

export function setupSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Game rooms tracking
  const gameRooms = new Map<string, Set<string>>();

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join game room
    socket.on('join-game', (roomId: string, userId: string) => {
      socket.join(roomId);

      if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, new Set());
      }
      gameRooms.get(roomId)!.add(userId);

      io.to(roomId).emit('player-joined', {
        userId,
        playersInRoom: gameRooms.get(roomId)!.size,
      });
    });

    // Game state update
    socket.on('game-update', (roomId: string, state: any) => {
      io.to(roomId).emit('game-state', state);
    });

    // Leave game
    socket.on('leave-game', (roomId: string, userId: string) => {
      socket.leave(roomId);

      const room = gameRooms.get(roomId);
      if (room) {
        room.delete(userId);
        if (room.size === 0) {
          gameRooms.delete(roomId);
        }
      }

      io.to(roomId).emit('player-left', {
        userId,
        playersInRoom: room?.size || 0,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
```

---

## 🚀 Phase 8: Main Server

### 8.1 Express App Setup

**File: `backend/src/app.ts`**

```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import authRoutes from './routes/auth';
import gameRoutes from './routes/games';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN }));
  app.use(express.json({ limit: '10mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests',
  });
  app.use('/api/', limiter);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/games', gameRoutes);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  // Error handling
  app.use(errorHandler);

  return app;
}
```

### 8.2 Server Entry Point

**File: `backend/src/server.ts`**

```typescript
import 'dotenv/config';
import http from 'http';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { setupSocket } from './config/socket';
import { config } from './config/env';

async function main() {
  try {
    // Connect database
    await connectDatabase();

    // Create app
    const app = createApp();

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Setup Socket.io
    const io = setupSocket(httpServer);

    // Start server
    httpServer.listen(config.PORT, config.HOST, () => {
      console.log(`\n🚀 Server running at http://${config.HOST}:${config.PORT}`);
      console.log(`📡 Socket.io ready for realtime connections`);
      console.log(`🔐 JWT enabled for authentication\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\n🛑 SIGTERM received, shutting down gracefully...');
      httpServer.close(async () => {
        await require('./config/database').disconnectDatabase();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
```

---

## 📝 Phase 9: Testing & Deployment

### 9.1 Local Testing

**Run in terminal:**

```bash
# Install dependencies
cd backend
npm install

# Setup environment
cp .env.example .env.local

# Start MongoDB locally (requires installation)
# For Windows: mongod.exe (from MongoDB installation)
# Or use MongoDB Atlas cloud: mongodb+srv://user:pass@cluster.mongodb.net

# Start backend
npm run dev

# Test endpoints
curl http://localhost:5000/health
```

### 9.2 Docker Setup for Local MongoDB

Create `backend/docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0-latest
    container_name: webworlds-db
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
    volumes:
      - mongo_data:/data/db
    networks:
      - webworlds-network

volumes:
  mongo_data:

networks:
  webworlds-network:
    driver: bridge
```

Run: `docker-compose up -d`

---

## 🌐 Phase 10: Railway Deployment

### 10.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from Repo" (or upload folder)
4. Link your GitHub repository

### 10.2 Add MongoDB to Railway

1. In Railway dashboard, click "+"
2. Search "MongoDB"
3. Add plugin
4. Copy connection string

### 10.3 Environment Variables on Railway

In Railway dashboard:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # From MongoDB plugin
JWT_SECRET=your-secure-random-string
CORS_ORIGIN=https://yourdomain.vercel.app
PORT=5000
```

### 10.4 Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

---

## ⚡ Performance Optimization Checklist

- ✅ **Database Indexes** - All queryable fields indexed
- ✅ **Connection Pooling** - Min 5, Max 10 connections
- ✅ **JWT over Sessions** - Stateless, scalable
- ✅ **Lean Queries** - `.lean()` for read-only data
- ✅ **Parallel Queries** - `Promise.all()` for independent operations
- ✅ **Rate Limiting** - DDoS protection
- ✅ **CORS** - Specific origins only
- ✅ **Helmet** - Security headers
- ✅ **Error Handling** - No stack traces in prod
- ✅ **Caching Ready** - Redis-compatible structure

---

## 📊 API Endpoints Summary

```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - Login & get token
GET    /api/auth/me                 - Get current user (needs token)

GET    /api/games                   - List games (paginated)
GET    /api/games/:id               - Get game details
POST   /api/games                   - Create game draft (needs token)
PUT    /api/games/:id               - Update game (needs token)
POST   /api/games/:id/publish       - Publish game (needs token)
POST   /api/games/:id/like          - Like game (needs token)
POST   /api/games/:id/unlike        - Unlike game (needs token)

GET    /health                      - Server health check
```

---

## 🎊 Next Steps

1. ✅ Create backend folder structure
2. ✅ Install dependencies
3. ✅ Setup MongoDB locally (Docker)
4. ✅ Run `npm run dev` 
5. ✅ Test endpoints with Postman/curl
6. ✅ Deploy to Railway
7. ✅ Connect frontend to backend URLs
8. ✅ Test e2e with frontend

---

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Start dev | `npm run dev` |
| Build | `npm run build` |
| Start prod | `npm start` |
| Test build | `npm run build && npm start` |

---

**Created:** February 8, 2026  
**Status:** Ready to implement  
**Est. Setup Time:** 2-3 hours local + 30 min Railway
