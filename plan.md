# WebWorlds - User-Generated Web Games Platform

*A lightweight, innovative web-based gaming platform similar to Roblox but entirely on the cloud. Optimized for weak devices and accessible globally.*

---

## 📋 Executive Summary

**WebWorlds** adalah platform gaming web yang memungkinkan user menciptakan dan memainkan game-game ringan secara real-time. Dibangun di atas **Vercel** (frontend) dan **Railway** (backend), platform ini dirancang khusus untuk performa optimal pada perangkat lemah dengan latency minimal.

**Diferensiator Utama:**
- ✅ 100% Web-based (tidak perlu instalasi)
- ✅ Lightweight & Progressive (mulai dari 50KB)
- ✅ Real-time multiplayer support
- ✅ User-generated content ecosystem
- ✅ Micro-game framework (game ringan)
- ✅ Serverless + Container hybrid architecture

---

## 🏗️ Architecture Overview

### High-Level Design
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  (Vercel CDN Edge Network - Global Distribution)        │
│  - Next.js/React Frontend                               │
│  - WebGL/Canvas Games (lightweight)                      │
│  - Service Worker (offline support)                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/WebSocket
┌────────────────────▼────────────────────────────────────┐
│              API LAYER (Vercel Serverless)              │
│  - Next.js API Routes (Authentication, Game List, etc)  │
│  - Image Optimization & Compression                     │
│  - Rate Limiting & Security                             │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
┌────────▼──┐ ┌──────▼──┐ ┌────▼──────┐
│  Railway  │ │ Railway │ │  Railway  │
│   WebSocket│ │Database │ │  Storage  │
│  Server   │ │(MongoDB)│ │  (S3-like)│
└───────────┘ └─────────┘ └───────────┘
```

### Infrastructure Stack

#### **Frontend (Vercel)**
- **Framework:** Next.js 14+ (App Router)
- **Rendering:** SSG + ISR (untuk game list)
- **Game Client:** Custom lightweight engine atau Babylon.js-Light
- **State:** Zustand (minimal bundle size)
- **Real-time:** Socket.io-client dengan compression
- **Build Size Target:** < 200KB gzipped

#### **Backend (Railway)**
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js + Socket.io
- **Database:** MongoDB (managed di Railway atau Atlas)
- **Cache:** Redis (untuk session & leaderboard)
- **Storage:** Railway PostgreSQL atau S3-compatible (Minio/Cloudinary)

#### **Game Execution**
- **Engine:** Custom ultra-lightweight 2D/3D renderer
- **Sandbox:** Web Worker + iframe isolation
- **Script Language:** JavaScript/TypeScript (No compilation needed)
- **Libraries:** Minimal (Babylon.js Playground Mode / Three.js es-modules)

---

## 🎮 Core Features

### 1. **Lightweight Game Engine**
```
Game Framework Specifications:
├── Physics: 2D only (Rapier compiled to WASM)
├── Rendering: WebGL2 (canvas fallback)
├── Scripting: JS/TS only (no compilation)
├── Max Game Size: 2-5MB (zipped)
├── Performance Target: 60FPS on mid-range phones
└── Minimum Requirements:
    ├── RAM: 256MB
    ├── CPU: 2x1GHz
    └── Network: 1MB/s
```

### 2. **User-Generated Content System**
```
Game Creation Flow:
┌──────────────┐
│ Browser IDE  │ → Drag-drop level editor
├──────────────┤
│ Asset Upload │ → Optimize on railway worker
├──────────────┤
│ Testing      │ → Hot reload (websocket)
├──────────────┤
│ Publishing   │ → Versioning + CDN cache
├──────────────┤
│ Analytics    │ → Play count, feedback
└──────────────┘
```

**Features:**
- **In-Browser Editor:** Monaco + Canvas Preview
- **Asset Pipeline:** Auto-compression, WebP conversion
- **Version Control:** Store up to 10 versions per game
- **Collaboration:** Multi-user editing (future)
- **Publishing:** One-click publish dengan auto-optimization

### 3. **Multiplayer System**
```
Real-time Architecture:
- WebSocket Server (Railway) dengan Rooms pattern
- Game State Sync: 15 ticks/second (lightweight)
- Input Buffering: Client-side prediction
- Lag Compensation: Server-authoritative physics
- Max Players/Game: 32 (optimized for weak networks)
- Bandwidth Per Player: ~2-5KB/s
```

### 4. **Optimization untuk Device Lemah**

#### **Assets Optimization**
```
Image Strategy:
├── WebP + JPG fallback
├── Max resolution: 1280x720
├── Texture atlas bundling
├── Lazy loading per game section
└── Target: < 50KB per game assets

Audio Strategy:
├── Opus codec (compact)
├── Frequency: 16kHz-22kHz max
├── Length: 30sec-5min clips
└── Target: < 100KB total per game

Code Bundling:
├── Tree-shaking aggressive
├── Module streaming (code-splitting)
├── Compression: Brotli 11
└── Target: Game code < 300KB
```

#### **Network Optimization**
```
- HTTP/3 + QUIC (faster on weak networks)
- CDN Edge caching (Vercel)
- Delta compression untuk state updates
- Adaptive bitrate untuk streaming
- Offline mode (Service Worker)
```

#### **Rendering Optimization**
```
- Automatic LOD (Level of Detail)
- WebGL batching
- Canvas rendering fallback
- Adaptive frame rate (30/60 FPS)
- Mobile-first responsive design
```

---

## 🗄️ Database & Data Model

### MongoDB Collections

```javascript
// Users Collection
{
  _id: ObjectId,
  username: String,
  email: String,
  avatar: String,
  createdAt: Date,
  stats: {
    gamesCreated: Number,
    gamesPlayed: Number,
    totalPlayTime: Number,
    followers: Number
  }
}

// Games Collection
{
  _id: ObjectId,
  title: String,
  description: String,
  creatorId: ObjectId,
  thumbnail: String,
  genre: String[],
  category: String,
  
  // Game Files
  mainFile: String, // URL ke zipped game
  version: Number,
  versionHistory: [{
    versionNumber: Number,
    uploadDate: Date,
    size: Number
  }],
  
  // Metadata
  rating: Number,
  plays: Number,
  likes: Number,
  comments: Number,
  featured: Boolean,
  published: Date,
  updated: Date,
  
  // Permissions
  visibility: "public|private|unlisted",
  allowComments: Boolean,
  
  // Tags & SEO
  tags: String[],
  keywords: String
}

// Game Sessions/Analytics
{
  _id: ObjectId,
  gameId: ObjectId,
  userId: ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number,
  score: Number,
  status: String
}

// Multiplayer Rooms (Real-time only, TTL: 24h)
{
  _id: ObjectId,
  gameId: ObjectId,
  roomId: String,
  hostId: ObjectId,
  players: [{
    userId: ObjectId,
    username: String,
    joinedAt: Date
  }],
  maxPlayers: Number,
  gameState: Object, // Compressed state
  createdAt: Date
}

// Leaderboards (Cached, updated every 5 min)
{
  _id: ObjectId,
  gameId: ObjectId,
  rank: Number,
  userId: ObjectId,
  username: String,
  score: Number,
  playTime: Number,
  timestamp: Date
}
```

---

## 🚀 Development Roadmap

### **Phase 1: MVP (4-6 minggu)**
- [ ] Authentication system (JWT + OAuth)
- [ ] Game listing & search
- [ ] Simple 2D game engine
- [ ] Browser-based game editor (basic)
- [ ] Basic multiplayer (2-4 player)
- [ ] Leaderboard system
- [ ] User profiles & stats
- [ ] **Target Launch:** Public alpha

**Tech Stack:**
- Frontend: Next.js, Zustand, Babylon.js Light
- Backend: Express + Socket.io
- Database: MongoDB + Redis
- Deployment: Vercel + Railway

### **Phase 2: Enhanced (3-4 minggu)**
- [ ] Advanced physics engine (WASM Rapier)
- [ ] Improved 3D support
- [ ] Asset marketplace
- [ ] Game analytics dashboard
- [ ] Social features (follow, comments, messages)
- [ ] In-game monetization (cosmetics)
- [ ] Better editor tools
- [ ] Collaboration features

### **Phase 3: Scale & Optimization (2-3 minggu)**
- [ ] AI-based game recommendations
- [ ] Advanced matchmaking system
- [ ] Streaming support (Watch games live)
- [ ] Mobile app (React Native)
- [ ] Enterprise API
- [ ] Content moderation AI
- [ ] CDN optimization

### **Phase 4: Ecosystem (Ongoing)**
- [ ] Creator fund
- [ ] Tournament system
- [ ] Game monetization platform
- [ ] SDK for external developers
- [ ] Open-source game templates

---

## 🛠️ Technology Stack Details

### Frontend Dependencies (Minimal)
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "zustand": "^4.4.0",
  "socket.io-client": "^4.7.0",
  "axios": "^1.6.0",
  "babylon.js": "^6.0.0", // atau three.js
  "framer-motion": "^10.0.0",
  "next-auth": "^4.24.0"
}

// Bundle Size Target: < 150KB (gzipped main)
```

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "socket.io": "^4.7.0",
  "mongoose": "^8.0.0",
  "redis": "^4.6.0",
  "jsonwebtoken": "^9.1.0",
  "bcryptjs": "^2.4.3",
  "dotenv": "^16.3.0",
  "cors": "^2.8.5"
}
```

### Game Engine Specs

**Option A: Custom Lightweight (Recommended)**
```javascript
// Ultra-minimal 2D engine (~30KB gzipped)
- Canvas/WebGL2 rendering
- Input handling (keyboard, touch, gamepad)
- Physics engine: 2D only (WASM Rapier)
- Particle system
- Sound playback
- Asset loader
```

**Option B: Babylon.js Playground Mode**
```javascript
// Lightweight 3D (~400KB gzipped)
- Full 3D support
- Built-in physics
- Better performance on modern browsers
- More features OOB
```

---

## 📊 Infrastructure Setup

### **Vercel Configuration**
```yaml
Deployment:
- Framework: Next.js
- Runtime: Node.js 18+
- Memory: 512MB (default)
- Timeout: 30s (API routes)
- Regions: Global edge network

Environment Variables:
- DATABASE_URL
- REDIS_URL
- API_SECRET
- JWT_SECRET
- SOCKET_IO_SERVER_URL
```

### **Railway Configuration**
```yaml
Services:
1. API Service
   - Runtime: Node.js + PM2
   - Memory: 512MB - 2GB (scalable)
   - Storage: 10GB
   - Region: Closest to users
   
2. MongoDB (Managed)
   - Plan: Build tier ($7/month)
   - Storage: 10GB
   - Auto-backups
   
3. Redis (Managed)
   - Plan: Build tier ($5/month)
   - Memory: 256MB
   - TTL: Auto-cleanup
   
4. Storage Service (Optional)
   - Minio container atau Cloudinary integration
   - For user assets & game files

Environment:
- Auto-scaling based on CPU/memory
- Health checks every 10s
- Auto-restart on failure
```

### **Estimated Costs (Monthly)**
```
Vercel:
├── Pro Plan: $20
└── Bandwidth: ~$0-10 (generous limits)

Railway:
├── API Server: $5 (micro) - $20+ (scaled)
├── MongoDB: $7
├── Redis: $5
└── Storage: ~$5

CDN/Assets:
├── Cloudinary: ~$0-10 (free tier generous)

Total: $42 - $70/month (MVP stage)
Scales with usage incrementally
```

---

## 🔐 Security Features

### Authentication & Authorization
```
- JWT with refresh tokens
- OAuth 2.0 (Google, GitHub)
- Rate limiting: 100 req/min per IP
- CORS whitelist
- CSRF protection
- Input validation & sanitization
```

### Game Code Sandbox
```
- Web Worker isolation
- Content Security Policy (CSP)
- No eval() execution
- File type whitelist
- Size limits per asset
- DDoS protection via Cloudflare
```

### Content Moderation
```
- Keyword filtering
- User reporting system
- Image NSFW detection (AI)
- Auto-ban malicious accounts
- Appeal process
```

---

## 📱 Performance Targets

### Lighthouse Scores
```
Desktop:
├── Performance: 95+
├── Accessibility: 100
├── Best Practices: 95
└── SEO: 100

Mobile:
├── Performance: 85+
├── Accessibility: 100
├── Best Practices: 95
└── SEO: 100
```

### Load Time Goals
```
Home Page:
├── FCP (First Contentful): < 1.5s
├── LCP (Largest Contentful): < 2.5s
├── CLS (Cumulative Layout Shift): < 0.1
└── TTI (Time to Interactive): < 3.5s

Game Launch:
├── Download: < 2s (500KB game)
├── Parse: < 0.5s
├── Render: 60FPS
└── Ready to Play: < 3s total
```

### Network Usage
```
Monthly per active user:
├── Game downloads: ~500MB
├── Multiplayer sync: ~50MB
├── Updates: ~100MB
└── Total estimate: ~650MB/month
```

---

## 🎯 MVP Feature List

### Must-Have (Week 1-2)
```
Frontend:
- Landing page
- User registration/login
- Game listing grid
- Game detail page
- Basic game player

Backend:
- User authentication API
- Game CRUD endpoints
- Static file serving
- Game list API with pagination
```

### Must-Have (Week 3-4)
```
Frontend:
- Simple 2D game engine
- Game editor (basic)
- Multiplayer lobby
- Leaderboard view

Backend:
- WebSocket server for multiplayer
- Multiplayer game state sync
- Leaderboard calculations
- Real-time updates
```

### Nice-to-Have (Week 5-6)
```
- Advanced game editor features
- User profiles
- Social features (follow, comments)
- Analytics dashboard
- Admin moderation tools
```

---

## 📈 Scaling Strategy

### Horizontal Scaling
```
Level 1 (0-1K players):
- Single Railway container
- Shared Redis instance
- MongoDB build tier

Level 2 (1K-10K players):
- Multiple Railway containers (load balanced)
- Dedicated Redis
- MongoDB standard tier
- Regional CDN optimization

Level 3 (10K+ players):
- Auto-scaling Railway containers
- Redis cluster
- Database sharding
- Multi-region deployment
- Dedicated cache layer
```

### Caching Strategy
```
Browser Cache:
- Static assets: 1 year
- Game code: 30 days
- Game assets: 7 days

CDN Cache (Vercel Edge):
- Game list: 5 minutes
- User profiles: 1 minute
- Leaderboard: 1 minute

Server Cache (Redis):
- Session: 24 hours
- Active rooms: 30 minutes
- Leaderboard: 5 minutes
```

---

## 🚨 Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **Weak Device Performance** | Aggressive asset compression, LOD system, canvas fallback |
| **Real-time Sync Latency** | Server-authoritative + client prediction, optimize tick rate |
| **User-Generated Content Safety** | Code sandboxing, content filters, community moderation |
| **Storage Costs** | Minio self-hosted, asset deduplication, old cleanup |
| **Bandwidth Heavy** | Progressive image loading, adaptive quality, compression |
| **Cold Starts (Serverless)** | Keep-alive pings, connection pooling, layer7 load balancing |
| **Concurrent Players Limit** | Horizontal scaling, shard games by region |

---

## 📝 Deployment Checklist

### Pre-Launch
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] CDN cache strategy implemented
- [ ] SSL certificates valid
- [ ] Rate limiting active
- [ ] DDoS protection enabled
- [ ] Logging & monitoring setup
- [ ] Backup system operational
- [ ] Analytics integration
- [ ] Error tracking (Sentry)

### Launch
- [ ] Load testing completed
- [ ] SEO optimization done
- [ ] Documentation published
- [ ] Support channel ready
- [ ] Monitoring dashboard live
- [ ] Incident response plan
- [ ] Community guidelines posted

---

## 🔄 Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/webworlds.git

# Frontend setup (Vercel)
cd frontend
pnpm install
pnpm dev  # http://localhost:3000

# Backend setup (Railway)
cd backend
pnpm install
pnpm dev  # http://localhost:3001

# Database & Cache
# Railway managed services - no local setup needed
# Or use docker-compose for local development

# Game Engine Development
cd game-engine
pnpm dev  # Develop lightweight render library

# Deploy
# Frontend: git push → automatic Vercel deployment
# Backend: git push → automatic Railway deployment
```

---

## 📚 Resources & References

### Game Engine Inspiration
- Babylon.js Playground Mode
- Itch.io tech stack
- PlayCanvas architecture
- Unreal Pixel Streaming

### Framework References
- Next.js App Router (https://nextjs.org)
- Socket.io rooms (https://socket.io/docs/v4/rooms/)
- MongoDB sharding (https://docs.mongodb.com/manual/sharding/)

### Performance Resources
- Web Vitals (https://web.dev/vitals/)
- WebGL optimization (https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- Network throttling (https://developer.chrome.com/docs/devtools/device-mode/network/)

---

## 🎓 Next Steps

1. **GitHub Setup:** Create public repository
2. **Database Decisions:** Finalize MongoDB vs PostgreSQL
3. **Game Engine Selection:** Choose between custom vs Babylon.js
4. **UI/UX Design:** Create wireframes & design system
5. **API Documentation:** OpenAPI/Swagger specs
6. **Community:** Discord server for feedback
7. **Begin Development:** Start Phase 1

---

**Last Updated:** February 2026
**Status:** Planning Phase ✓
**Next Milestone:** Phase 1 Development Start
