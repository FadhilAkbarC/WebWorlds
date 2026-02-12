# WebWorlds Backend API

Fast, lightweight, production-ready Express.js backend for WebWorlds gaming platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/webworlds
JWT_SECRET=your-secret-key-change-this
CORS_ORIGIN=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

Server will run at `http://localhost:5000`

### 4. Check Health

```bash
curl http://localhost:5000/health
```

## 📦 Database Setup

### Option A: Local MongoDB with Docker

```bash
docker-compose up -d
```

This starts MongoDB on `localhost:27017` with credentials:
- Username: `admin`
- Password: `admin`

### Option B: MongoDB Atlas (Cloud)

1. Create free account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create cluster (free tier available)
3. Copy connection string: `mongodb+srv://user:password@cluster.mongodb.net/webworlds`
4. Update `MONGODB_URI` in `.env.local`

## 🔧 Available Scripts

```bash
npm run dev          # Start development server (auto-reload)
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run compiled server (production)
npm run type-check   # Check TypeScript without building
npm run migrate      # Initialize database (placeholder)
```

## 📡 API Endpoints

### Authentication

```
POST /api/auth/register
  Body: { username, email, password }
  Returns: { token, user }

POST /api/auth/login
  Body: { email, password }
  Returns: { token, user }

GET /api/auth/me
  Headers: Authorization: Bearer {token}
  Returns: { user profile }
```

### Games

```
GET /api/games?page=1&limit=12&search=term&category=action
  Returns: Paginated list of published games

GET /api/games/:id
  Returns: Game details

POST /api/games
  Headers: Authorization: Bearer {token}
  Body: { title, description, code }
  Returns: Created game

PUT /api/games/:id
  Headers: Authorization: Bearer {token}
  Body: { title, description, code, settings, scripts, assets }
  Returns: Updated game

POST /api/games/:id/publish
  Headers: Authorization: Bearer {token}
  Returns: Published game

POST /api/games/:id/like
  Headers: Authorization: Bearer {token}
  Returns: Game with updated likes

POST /api/games/:id/unlike
  Headers: Authorization: Bearer {token}
  Returns: Game with decremented likes

DELETE /api/games/:id
  Headers: Authorization: Bearer {token}
  Returns: { message: "Game deleted" }
```

## 🔐 Authentication

All protected routes require JWT token in Authorization header:

```bash
curl -H "Authorization: Bearer {your-token}" \
  http://localhost:5000/api/auth/me
```

Token is valid for 7 days (configurable with `JWT_EXPIRY` env var).

## 🌐 WebSocket (Real-time Multiplayer)

Connect via Socket.io at `ws://localhost:5000`:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

// Join game room
socket.emit('join-game', { 
  roomId: 'game-123', 
  userId: 'user-456',
  playerName: 'Player'
});

// Receive game updates
socket.on('game-state', (state) => {
  console.log('Game state:', state);
});

// Send game update
socket.emit('game-update', {
  roomId: 'game-123',
  state: { players: [...], score: 100 },
  timestamp: Date.now()
});
```

## 📊 Database Models

### User
- `username` - Unique, 3-30 chars
- `email` - Unique
- `passwordHash` - Bcrypt hashed
- `stats` - { gamesCreated, gamesPlayed, followers, totalPlaytime }
- `createdGames` - Array of Game IDs
- `likedGames` - Array of Game IDs

### Game
- `title` - 3-100 chars
- `description` - Max 1000 chars
- `creator` - User ID reference
- `code` - Game code
- `scripts` - Array of code modules
- `assets` - Array of resources (images, sounds, etc)
- `settings` - { width, height, fps, maxPlayers, isMultiplayer }
- `stats` - { plays, likes, averageRating, totalRatings }
- `category` - action | puzzle | adventure | sports | other
- `published` - Boolean

### GameSession
- `game` - Game ID reference
- `player` - User ID reference
- `startTime` - When game started
- `endTime` - When game ended
- `duration` - Seconds played
- `score` - Final score

### Leaderboard
- `game` - Game ID reference
- `player` - User ID reference
- `score` - Player's best score
- `rank` - Position on leaderboard

## ⚡ Performance Features

- ✅ **Indexed Queries** - All search fields indexed for fast lookups
- ✅ **Lean Queries** - Read-only queries use `.lean()` for performance
- ✅ **Parallel Queries** - Independent operations run with `Promise.all()`
- ✅ **Connection Pooling** - Min 5, Max 10 MongoDB connections
- ✅ **Rate Limiting** - DDoS protection on `/api/` routes
- ✅ **JWT Stateless** - No session store needed
- ✅ **CORS Restricted** - Only accept requests from frontend origin
- ✅ **Security Headers** - Helmet.js enabled

## 🧪 Testing Endpoints

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Get Current User
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/auth/me
```

### List Games
```bash
curl "http://localhost:5000/api/games?page=1&limit=12"
```

### Create Game
```bash
curl -X POST http://localhost:5000/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "My Game",
    "description": "A fun game",
    "code": "console.log(\"Hello\")"
  }'
```

## 🚀 Deployment

### Deploy to Railway

1. **Create Railway account**: https://railway.app

2. **Connect repository**:
   ```bash
   railway login
   railway link
   ```

3. **Add environment variables**:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   railway variables set MONGODB_URI=<your-mongodb-atlas-uri>
   railway variables set JWT_SECRET=<generate-random-32-chars>
   railway variables set CORS_ORIGIN=https://yourfrontend.vercel.app
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Get production URL**:
   ```bash
   railway status
   ```

### MongoDB on Railway

Add MongoDB plugin:
```bash
railway add
# Select MongoDB
```

It will automatically set `MONGODB_URI` env var.

## 🔗 Frontend Integration

Update frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000  # Development
NEXT_PUBLIC_API_URL=https://your-backend.railway.app  # Production
```

In frontend API client, use this URL for all requests.

## 📝 Project Structure

```
backend/
├── src/
│   ├── server.ts           # Entry point
│   ├── create-app.ts       # Express setup
│   ├── config/             # Configuration
│   │   ├── database.ts
│   │   ├── socket.ts
│   │   └── env.ts
│   ├── models/             # MongoDB schemas
│   │   ├── User.ts
│   │   ├── Game.ts
│   │   ├── GameSession.ts
│   │   ├── Leaderboard.ts
│   │   └── index.ts
│   ├── controllers/        # Business logic
│   │   ├── auth.controller.ts
│   │   └── game.controller.ts
│   ├── routes/             # API routes
│   │   ├── auth.routes.ts
│   │   └── games.routes.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts
│   │   ├── error-handler.ts
│   │   └── validation.ts
│   └── utils/              # Utilities
│
├── dist/                   # Compiled JavaScript
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
└── README.md (this file)
```

## 💡 Tips

- **Never commit `.env.local`** - Use `.env.example` for templates
- **Generate JWT_SECRET**: `openssl rand -base64 32`
- **Monitor logs** in production via Railway dashboard
- **Scale connections** when load increases via Railway resources
- **Cache frequently** accessed data with Redis (optional)
- **Use Postman** for API testing

## 🆘 Troubleshooting

### MongoDB Connection Failed
- Check MongoDB is running: `mongosh` or `mongo`
- Verify `MONGODB_URI` is correct
- Check firewall isn't blocking port 27017

### Token Expired
- Tokens expire after 7 days
- User must login again to get new token
- Change `JWT_EXPIRY` in `.env.local` if needed

### CORS Error
- Check `CORS_ORIGIN` matches frontend URL
- Development: `http://localhost:3000`
- Production: `https://yourdomain.vercel.app`

### Rate Limiting
- Limits resets every 15 minutes
- Default: 100 requests per 15 min
- Change `RATE_LIMIT_MAX_REQUESTS` if needed

## 📚 More Resources

- [Express.js Docs](https://expressjs.com)
- [Mongoose Docs](https://mongoosejs.com)
- [Socket.io Docs](https://socket.io/docs)
- [JWT.io](https://jwt.io)
- [Railway Docs](https://docs.railway.app)

## 📝 License

MIT - Use freely for any project

---

**Status**: Production Ready ✅  
**Version**: 0.1.0  
**Last Updated**: February 8, 2026
