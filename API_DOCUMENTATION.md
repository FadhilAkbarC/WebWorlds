# 📚 Complete API Documentation - WebWorlds

Full reference guide for WebWorlds REST API and WebSocket events.

---

## 🌐 Base URLs

### Development
```
http://localhost:5000
```

### Production
```
https://your-backend.railway.app
```

---

## 🔐 Authentication

### JWT Token
All authenticated endpoints require:

```json
Authorization: Bearer <token>
```

### How to Get Token

**1. Register New User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "newuser",
    "email": "user@example.com"
  }
}
```

**2. Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "newuser",
    "email": "user@example.com"
  }
}
```

**3. Use Token**
```text
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🏥 Health & Status

### Check Server Health

```http
GET /health
```

Response (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "production"
}
```

### API Info

```http
GET /api
```

Response (200 OK):
```json
{
  "name": "WebWorlds Backend API",
  "version": "1.0.0",
  "status": "OK",
  "endpoints": {
    "authentication": 4,
    "games": 8,
    "total": 12
  },
  "websocket": "enabled",
  "docs": "See /api/docs for details"
}
```

---

## 👤 Authentication Endpoints

### Register New User

**Endpoint**: `POST /api/auth/register`

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- `username`: 3-30 characters, alphanumeric + underscore
- `email`: Valid email format
- `password`: 8+ characters, must include uppercase and numbers

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- 400: Username/email already exists
- 400: Invalid input format
- 500: Database error

---

### Login

**Endpoint**: `POST /api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MDM0MzcyMzcsImV4cCI6MTYwMzUyMzYzN30.z_A4DvXf3uMb0bfj4Iz-1234567890",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- 401: Invalid credentials
- 400: Missing email or password
- 500: Server error

---

### Get Current User

**Endpoint**: `GET /api/auth/me`

**Authorization**: Required

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "stats": {
      "gamesCreated": 2,
      "gamesPlayed": 15,
      "followers": 5,
      "totalPlaytime": 3600
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- 401: No token provided
- 401: Invalid/expired token

---

### Get User Profile

**Endpoint**: `GET /api/auth/profile/:userId`

**Parameters:**
- `userId`: User ID (path parameter)

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "stats": {
      "gamesCreated": 2,
      "gamesPlayed": 15,
      "followers": 5,
      "totalPlaytime": 3600
    },
    "createdGames": [
      {
        "id": "507f1f77bcf86cd799439012",
        "title": "Flappy Bird Clone",
        "description": "A fun flappy bird game",
        "stats": {
          "plays": 42,
          "likes": 15,
          "rating": 4.5
        }
      }
    ],
    "followers": [
      {
        "id": "507f1f77bcf86cd799439013",
        "username": "user2"
      }
    ]
  }
}
```

**Error Responses:**
- 404: User not found
- 500: Server error

---

## 🎮 Games Endpoints

### List Games

**Endpoint**: `GET /api/games`

**Query Parameters:**
- `search`: Search by title or description
- `category`: Filter by category (action, puzzle, adventure, sports, other)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 100)
- `sortBy`: Sort field (createdAt, plays, likes) (default: createdAt)

**Examples:**
```
GET /api/games?page=1&limit=12
GET /api/games?search=flappy
GET /api/games?category=action&sortBy=plays
GET /api/games?search=bird&category=action&page=2
```

**Response (200 OK):**
```json
{
  "success": true,
  "games": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Flappy Bird Clone",
      "description": "A fun flappy bird game",
      "category": "action",
      "creator": {
        "id": "507f1f77bcf86cd799439011",
        "username": "johndoe"
      },
      "stats": {
        "plays": 42,
        "likes": 15,
        "rating": 4.5
      },
      "settings": {
        "width": 400,
        "height": 600,
        "fps": 60,
        "isMultiplayer": false
      },
      "published": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalGames": 52,
    "itemsPerPage": 12
  }
}
```

**Error Responses:**
- 500: Server error

---

### Get Game Details

**Endpoint**: `GET /api/games/:gameId`

**Parameters:**
- `gameId`: Game ID (path parameter)

**Response (200 OK):**
```json
{
  "success": true,
  "game": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Flappy Bird Clone",
    "description": "A fun flappy bird game with smooth controls",
    "category": "action",
    "creator": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "stats": {
        "gamesCreated": 5,
        "followers": 10
      }
    },
    "code": "// Game code here\nconst canvas = document.getElementById('gameCanvas');\n...",
    "assets": [
      {
        "id": "asset1",
        "name": "bird.png",
        "type": "image",
        "url": "https://..."
      }
    ],
    "stats": {
      "plays": 42,
      "likes": 15,
      "rating": 4.5,
      "comments": 3
    },
    "settings": {
      "width": 400,
      "height": 600,
      "fps": 60,
      "isMultiplayer": false
    },
    "published": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:30:00Z"
  }
}
```

**Error Responses:**
- 404: Game not found
- 500: Server error

---

### Create Game

**Endpoint**: `POST /api/games`

**Authorization**: Required

**Request:**
```json
{
  "title": "Flappy Bird Clone",
  "description": "A fun flappy bird game with smooth controls",
  "category": "action",
  "code": "// Your JavaScript game code here\nconst canvas = document.getElementById('gameCanvas');",
  "settings": {
    "width": 400,
    "height": 600,
    "fps": 60,
    "isMultiplayer": false
  }
}
```

**Validation Rules:**
- `title`: 3-50 characters
- `description`: 10-500 characters
- `category`: One of (action, puzzle, adventure, sports, other)
- `width`: 320-2560 pixels
- `height`: 240-1440 pixels
- `fps`: 15-120

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Game created successfully",
  "game": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Flappy Bird Clone",
    "description": "A fun flappy bird game with smooth controls",
    "category": "action",
    "creator": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe"
    },
    "code": "// Your JavaScript game code here...",
    "settings": {
      "width": 400,
      "height": 600,
      "fps": 60,
      "isMultiplayer": false
    },
    "published": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 400: Invalid input format
- 500: Server error

---

### Update Game

**Endpoint**: `PUT /api/games/:gameId`

**Authorization**: Required (owner only)

**Parameters:**
- `gameId`: Game ID (path parameter)

**Request:**
```json
{
  "title": "Flappy Bird Clone v2",
  "description": "Updated with better graphics",
  "category": "action",
  "code": "// Updated game code here",
  "settings": {
    "width": 400,
    "height": 600,
    "fps": 60,
    "isMultiplayer": false
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Game updated successfully",
  "game": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Flappy Bird Clone v2",
    "description": "Updated with better graphics",
    "updatedAt": "2024-01-20T14:30:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 403: Not the owner
- 404: Game not found
- 400: Invalid input
- 500: Server error

---

### Publish Game

**Endpoint**: `POST /api/games/:gameId/publish`

**Authorization**: Required (owner only)

**Parameters:**
- `gameId`: Game ID (path parameter)

**Request:** (empty body)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Game published successfully",
  "game": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Flappy Bird Clone",
    "published": true,
    "publishedAt": "2024-01-20T14:30:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 403: Not the owner
- 404: Game not found
- 400: Game already published
- 500: Server error

---

### Delete Game

**Endpoint**: `DELETE /api/games/:gameId`

**Authorization**: Required (owner only)

**Parameters:**
- `gameId`: Game ID (path parameter)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Game deleted successfully"
}
```

**Error Responses:**
- 401: Unauthorized
- 403: Not the owner
- 404: Game not found
- 500: Server error

---

### Like Game

**Endpoint**: `POST /api/games/:gameId/like`

**Authorization**: Required

**Parameters:**
- `gameId`: Game ID (path parameter)

**Request:** (empty body)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Game liked successfully",
  "game": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Flappy Bird Clone",
    "stats": {
      "likes": 16
    }
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 404: Game not found
- 400: Already liked
- 500: Server error

---

### Unlike Game

**Endpoint**: `POST /api/games/:gameId/unlike`

**Authorization**: Required

**Parameters:**
- `gameId`: Game ID (path parameter)

**Request:** (empty body)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Like removed successfully",
  "game": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Flappy Bird Clone",
    "stats": {
      "likes": 15
    }
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 404: Game not found
- 400: Not liked
- 500: Server error

---

### Get Creator's Games

**Endpoint**: `GET /api/games/creator/:creatorId`

**Parameters:**
- `creatorId`: Creator ID (path parameter)

**Query Parameters:**
- `published`: true/false (filter by published status)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)

**Response (200 OK):**
```json
{
  "success": true,
  "creator": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe"
  },
  "games": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Flappy Bird Clone",
      "published": true,
      "stats": {
        "plays": 42,
        "likes": 15
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalGames": 3
  }
}
```

**Error Responses:**
- 404: Creator not found
- 500: Server error

---

## 🔌 WebSocket Events (Real-Time)

### Connection

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Join Game

**Client to Server:**
```javascript
socket.emit('join-game', {
  gameId: '507f1f77bcf86cd799439012',
  playerId: '507f1f77bcf86cd799439011'
});
```

**Server Response:**
```javascript
socket.on('game-joined', (data) => {
  console.log('Joined game:', data.gameId);
  console.log('Players in game:', data.players);
});
```

### Game Update

**Client sends action:**
```javascript
socket.emit('game-update', {
  gameId: '507f1f77bcf86cd799439012',
  action: 'jump',
  timestamp: Date.now()
});
```

**Server broadcasts:**
```javascript
socket.on('player-action', (data) => {
  console.log('Player action:', data.playerId, data.action);
});
```

### Update Score

**Client sends score:**
```javascript
socket.emit('update-score', {
  gameId: '507f1f77bcf86cd799439012',
  score: 150,
  timestamp: Date.now()
});
```

**Server broadcasts:**
```javascript
socket.on('score-updated', (data) => {
  console.log('New score:', data.playerId, data.score);
});
```

### Leave Game

**Client leaves:**
```javascript
socket.emit('leave-game', {
  gameId: '507f1f77bcf86cd799439012'
});
```

### Disconnect

```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

---

## 🚨 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

### Common HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate data |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Server error |

---

## 📊 Rate Limiting

All endpoints are rate-limited to prevent abuse:

- **Default:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 5 requests per 15 minutes per IP
- **Game creation:** 10 games per day per user

**Response when limit exceeded:**
```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again later.",
  "retryAfter": 900
}
```

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

### List Games
```bash
curl http://localhost:5000/api/games?page=1&limit=12
```

### Get Game Details
```bash
curl http://localhost:5000/api/games/507f1f77bcf86cd799439012
```

### Create Game (requires token)
```bash
curl -X POST http://localhost:5000/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My Game",
    "description": "A fun game",
    "category": "action",
    "code": "// game code",
    "settings": {"width": 400, "height": 600, "fps": 60}
  }'
```

---

## 🔗 Testing with Postman

1. Create new collection: "WebWorlds API"
2. Set base URL: `http://localhost:5000`
3. Create requests:

**Register**
- POST `/api/auth/register`
- Body: `{"username":"test","email":"test@example.com","password":"Test123"}`

**Login**
- POST `/api/auth/login`
- Body: `{"email":"test@example.com","password":"Test123"}`
- Save response token

**Get Games**
- GET `/api/games`
- No auth needed

**Create Game**
- POST `/api/games`
- Headers: `Authorization: Bearer {token}`
- Body: Game object

---

## 📖 SDK/Client Libraries

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000'
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// List games
const games = await client.get('/api/games?page=1');

// Create game
const newGame = await client.post('/api/games', {
  title: 'My Game',
  description: 'A fun game',
  category: 'action',
  code: '// code here',
  settings: { width: 400, height: 600, fps: 60 }
});
```

---

## 🔄 API Versioning

Current API version: **v1**

All endpoints are `/api/` (v1 is implied)

Future versions will use `/api/v2/`, etc.

---

## 📝 Changelog

### v1.0.0 (Current)
- Initial API release
- 15 REST endpoints
- WebSocket support
- JWT authentication
- Rate limiting
- Full documentation

---

## ✅ Checklist for Using the API

- [ ] Read authentication section
- [ ] Get JWT token
- [ ] Test GET /health
- [ ] Test GET /api
- [ ] Create test account
- [ ] Create test game
- [ ] Like a game
- [ ] Browse games with search
- [ ] Get game details
- [ ] Update game
- [ ] Publish game
- [ ] Connect WebSocket (optional)

---

**API Status: 🟢 STABLE**

**Last Updated: 2024**

**For issues or questions, check TROUBLESHOOTING_GUIDE.md**
