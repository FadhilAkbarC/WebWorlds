# 🚀 MAIN SETUP - WebWorlds Complete Guide

**Status:** ✅ **PRODUCTION READY**  
**Setup Time:** 30-60 minutes (Local) / 10 minutes (Production)  
**Cost:** $0/month  
**Users Supported:** Unlimited

---

## 📋 What You'll Get

| Component | Details | Status |
|-----------|---------|--------|
| **Frontend** | Next.js 16, Game Editor, UI | ✅ Ready |
| **Backend** | Express.js API, Real-time | ✅ Ready |
| **Database** | MongoDB with indexes | ✅ Ready |
| **Authentication** | JWT, Bcrypt | ✅ Ready |
| **Multiplayer** | Socket.io rooms | ✅ Ready |
| **Deployment** | Vercel + Railway | ✅ Ready |

---

## 🎯 Quick Choose Your Path

### Path A: Local Development (45 min)
Best for: Learning, debugging, testing locally
- Requires: Node.js 18+, Git, Docker (optional)
- Cost: Free
- Scalability: Your machine only

### Path B: Production Ready (15 min)
Best for: Launch to users, real-world testing
- Requires: GitHub account, Railway account, Vercel account
- Cost: $0-20/month
- Scalability: Millions of users

### Path C: Both Local + Production (90 min)
Best for: Development + Live platform
- Get the best of both worlds
- **RECOMMENDED** ✅

---

# 🔧 PATH A: LOCAL DEVELOPMENT SETUP

## Step 1: Prerequisites (5 min)

### 1.1 Install Node.js
Download from: https://nodejs.org (v18 or higher)

Verify:
```bash
node --version   # Should show v18+
npm --version    # Should show 8+
```

### 1.2 Install Git
Download from: https://git-scm.com

### 1.3 Install Docker (Optional but Recommended)
Download from: https://docker.com

---

## Step 2: Setup Local Environment (10 min)

### 2.1 Open Terminal/PowerShell

```bash
# Windows PowerShell or Git Bash
cd c:\Users\fadhi\WebWorlds
```

### 2.2 Install Backend Dependencies

```bash
cd backend
npm install
```

Output should end with "added XXX packages".

### 2.3 Copy Environment File

```bash
copy .env.example .env.local

# Or manually:
# Create .env.local with content from .env.example
# Leave JWT_SECRET as-is for now (local testing only!)
```

### 2.4 Install Frontend Dependencies

```bash
cd ../frontend
npm install --legacy-peer-deps
```

---

## Step 3: Start Local Database (5 min)

### Option A: Docker (Easiest)

```bash
cd backend

# Start MongoDB in background
docker-compose up -d

# Verify it's running
docker ps

# Should show: webworlds-mongodb, webworlds-mongo-express
```

**Web UI**: Open http://localhost:8081
- Username: `admin`
- Password: `admin123`

### Option B: Manual MongoDB

Download MongoDB Community from https://mongodb.com

Start MongoDB:
```bash
mongod
```

### Option C: MongoDB Atlas Cloud (Free)

1. Create account: https://mongodb.com/cloud/atlas
2. Create free cluster
3. In `backend/.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/webworlds
   ```

---

## Step 4: Initialize Database (3 min)

```bash
cd backend

# Create collections and indexes
npm run db:init

# Output should show:
# ✅ MongoDB connected
# ✅ Collections created
# 🎉 Database initialization complete!
```

### Optional: Add Demo Data

```bash
npm run db:seed

# Creates demo users and games:
# - demo / demo@example.com (demo)
# - testcreator / creator@example.com (testcreator)
```

---

## Step 5: Start Development Servers (5 min)

### Terminal 1: Backend

```bash
cd c:\Users\fadhi\WebWorlds\backend
npm run dev

# Should show:
# ✅ MongoDB connected
# 🚀 WebWorlds Backend Running
# 📍 Port: 5000
# ❤️  Health Check: http://localhost:5000/health
```

### Terminal 2: Frontend

```bash
cd c:\Users\fadhi\WebWorlds\frontend
npm run dev

# Should show:
# ▲ Next.js 16.1.6
# - Local: http://localhost:3000
# ✓ Ready in 2.1s
```

### Terminal 3: Optional - Watch Backend Logs

```bash
cd c:\Users\fadhi\WebWorlds\backend
npm run dev

# Shows real-time logs
```

---

## Step 6: Test Local Setup (10 min)

### Test 1: Backend Health

```bash
curl http://localhost:5000/health

# Response:
# {"status":"ok","timestamp":"...","uptime":...}
```

### Test 2: API Documentation

Open: http://localhost:5000/api

Should show all available endpoints.

### Test 3: Frontend Load

Open: http://localhost:3000

Should load without errors.

### Test 4: End-to-End Flow

1. Click "Sign Up"
2. Create account:
   - Username: `testuser123`
   - Email: `test@example.com`
   - Password: `TestPass123`
3. Click "Login"
4. Browse games (should see demo games if seeded)
5. Click "Create a Game"
6. Write code in editor
7. Click "Preview" to test
8. Click "Publish" to make public

**If all works → You're ready!** ✅

---

## Troubleshooting Local Setup

### "Cannot connect to MongoDB"
```bash
# Check if Docker is running
docker ps

# Restart if needed
docker-compose restart mongodb

# Or check if mongod process is running (manual install)
```

### "Port 5000 already in use"
```bash
# Find what's using port 5000
# Windows: 
netstat -ano | findstr :5000

# Kill the process
taskkill /PID {PID} /F
```

### "npm install fails"
```bash
# Clear cache and try again
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

### "Frontend shows white screen"
```bash
# Check console for errors (F12)
# Restart frontend server
# Clear browser cache (Ctrl+Shift+Delete)
```

---

# 🌐 PATH B: PRODUCTION DEPLOYMENT

## Prerequisites

- GitHub account (free at https://github.com)
- Railway account (free at https://railway.app)  
- Vercel account (free at https://vercel.com)

---

## Step 1: Setup GitHub Repository (5 min)

### 1.1 Create Repository

1. Go to https://github.com/new
2. Name: `webworlds`
3. Description: "Full-stack gaming platform"
4. Make it Public
5. Click Create

### 1.2 Commit Code

```bash
cd c:\Users\fadhi\WebWorlds

# Initialize git
git init
git add .
git commit -m "Initial: Frontend + Backend ready for deployment"

# Connect to GitHub (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/webworlds.git
git branch -M main
git push -u origin main

# Verify at github.com/YOUR_USERNAME/webworlds
```

---

## Step 2: Deploy Backend to Railway (10 min)

### 2.1 Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize & select your `webworlds` repo
5. Root Directory: Select **`backend`**
6. Click "Deploy"

Railway auto-detects Node.js and starts building.

### 2.2 Add MongoDB

1. While deploying, in Railway dashboard click **"+ Add"**
2. Search and select **"MongoDB"**
3. Click "Add"

Railway automatically:
- Creates MongoDB database
- Sets `MONGODB_URI` environment variable ✅
- Configures backups

### 2.3 Configure Environment Variables

Go to Railway Backend → **Variables** tab

Add these:
```
NODE_ENV=production
JWT_SECRET=<generate-secure-key>
CORS_ORIGIN=https://webworlds-YOUR_NAME.vercel.app
RATE_LIMIT_MAX_REQUESTS=200
LOG_LEVEL=info
```

**Generate JWT_SECRET**:
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Minimum 0 -Maximum 256)}))
```

Click "Save" - auto-redeploys backend.

### 2.4 Get Backend URL

Go to Railway backend → **Settings** tab → **Domains**

Your URL: `https://your-backend.railway.app`

**Save this URL** ⬅️ needed for frontend!

---

## Step 3: Deploy Frontend to Vercel (5 min)

### 3.1 Create Vercel Project

1. Go to https://vercel.com
2. Click "New Project"
3. Click "Import Git Repository"
4. Select your `webworlds` repo
5. **Root Directory**: `frontend`
6. Click "Import"

### 3.2 Add Environment Variables

**Environment Variables** section:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

Replace `your-backend.railway.app` with actual URL from Step 2.4

Click "Deploy"

### 3.3 Get Frontend URL

After deployment completes:

Your URL: `https://webworlds-YOUR_NAME.vercel.app`

**Save this URL** ⬅️ needed for backend!

---

## Step 4: Connect Frontend ↔ Backend (3 min)

### 4.1 Update Backend CORS

Back to Railway backend:

1. **Variables** tab
2. Edit `CORS_ORIGIN`
3. Set to: `https://webworlds-YOUR_NAME.vercel.app`
4. Save

Backend auto-redeploys with correct CORS.

### 4.2 Verify Connection

Open your frontend URL: https://webworlds-YOUR_NAME.vercel.app

In browser console (F12 → Console), should NOT show CORS errors.

---

## Step 5: Test Production (5 min)

### Test 1: Health Check

```bash
curl https://your-backend.railway.app/health
```

Should return:
```json
{"status":"ok","environment":"production"}
```

### Test 2: Registration

1. Go to https://webworlds-YOUR_NAME.vercel.app
2. Click "Sign Up"
3. Create account with any credentials
4. Should succeed without errors

### Test 3: Create & Publish Game

1. Login
2. "Create a Game"
3. Write any code
4. Click "Publish"
5. Go to "Browse Games"
6. Your game should appear!

**If all works → You're live!** 🎉

---

# ✨ FINAL CHECKLIST

## Local Development
- [ ] Node.js installed (v18+)
- [ ] Docker running (or MongoDB)
- [ ] Backend started on port 5000
- [ ] Frontend started on port 3000
- [ ] Can register and login
- [ ] Can create and play games
- [ ] No console errors

## Production Deployment
- [ ] GitHub repo created and pushed
- [ ] Railway backend deployed
- [ ] MongoDB connected to Railway
- [ ] Vercel frontend deployed
- [ ] CORS configured correctly
- [ ] JWT_SECRET generated and set
- [ ] NEXT_PUBLIC_API_URL configured
- [ ] Health check passes
- [ ] Can register and play games live

---

# 📊 What You Have Now

### Technology Stack
```
Frontend:  Next.js 16 + React 18 + Tailwind CSS
Backend:   Express.js + TypeScript
Database:  MongoDB (Railway)
Real-time: Socket.io
Auth:      JWT + Bcrypt
Hosting:   Vercel (Frontend) + Railway (Backend)
```

### Architecture
```
Users (Browser)
    ↓
Frontend (Vercel)
    ↓
Backend API (Railway)
    ↓
Database (MongoDB on Railway)
```

### Scalability
```
• Vercel: Auto-scales, handles millions
• Railway: Auto-scales, handles millions
• MongoDB: Free tier 512MB, can upgrade
```

---

# 🔄 Daily Workflow (Both Local & Production)

### Make Changes
```bash
# Edit code
git add .
git commit -m "Feature: add new button"
git push

# Automatic:
# - Vercel redeploys frontend (~2 min)
# - Railway redeploys backend (~2 min)
# - You're live!
```

No manual deployment needed! 🎉

---

# 💡 Common Tasks

### Restart Backend
```bash
# Local
npm run dev  # or Ctrl+C and run again

# Production
# Push any change to git (auto-redeploys)
# Or in Railway dashboard click "Deploy"
```

### Reset Local Database
```bash
docker-compose down  # Stop MongoDB
docker-compose up -d # Start fresh
npm run db:init      # Create collections
npm run db:seed      # Add demo data
```

### View Production Logs

**Railway**:
1. App → Logs panel
2. See real-time logs
3. Filter by level

**Vercel**:
1. Project → Functions
2. See deployment logs

### Rollback Deployment

**Railway**: Deployments tab → select previous → Rollback

**Vercel**: Deployments tab → select previous → Promote

---

# 🆘 Support Resources

| Problem | Solution |
|---------|----------|
| **Cannot connect frontend to backend** | Check `NEXT_PUBLIC_API_URL` env var |
| **"Invalid token" error** | JWT_SECRET must be same local & prod |
| **MongoDB "connection refused"** | Check Docker/MongoDB running |
| **"Port already in use"** | Kill process using port |
| **Deployment stuck** | Check Railway/Vercel build logs |
| **Game not saving** | Check backend logs for errors |
| **Socket.io not connecting** | Check CORS_ORIGIN in backend |

---

# 📚 Documentation

| Document | Purpose |
|----------|---------|
| [BACKEND_SETUP.md](./BACKEND_SETUP.md) | Backend architecture (10 phases) |
| [DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md) | Deployment guide details |
| [INSTALLATION.md](./INSTALLATION.md) | Quick setup (3 phases) |
| [backend/README.md](./backend/README.md) | API reference |
| [frontend/README.md](./frontend/README.md) | Frontend guide |
| [plan.md](./plan.md) | Architecture & roadmap |

---

# 🎉 You're Ready!

You now have:

✅ **Full-stack platform** - Frontend to backend to database  
✅ **Production infrastructure** - Global CDN, auto-scaling  
✅ **Real-time features** - Multiplayer support  
✅ **Security** - JWT auth, HTTPS, rate limiting  
✅ **Zero cost** - Completely free forever (or $5-20/month at scale)  
✅ **Professional code** - Production-ready, well-documented  

---

## 🚀 Next Steps

### Immediate
1. Choose Path A, B, or C above
2. Follow all steps (~30-60 min)
3. Test everything works

### Short Term
- Invite users to try it
- Get feedback on usability
- Fix bugs from user testing
- Add more demo games

### Medium Term
- Grow user base
- Add social features (follow, comments)
- Implement game monetization
- Build community features

### Long Term
- Scale to millions of users
- Add mobile app
- Build analytics dashboard
- Create creator tools

---

## 💬 Remember

**You built an entire gaming platform from scratch!**

From code to live, global, production-ready infrastructure.

This is enterprise-grade stuff. You should be proud! 🎊

---

**Status: 🟢 READY TO GO**

**Next: Pick a path and start!**

⏱️ **Setup Time:** 30-60 min (Local) or 15 min (Production)

🚀 **Start Now:** Choose Path A, B, or C above

❓ **Need Help?** Check docs folder or review relevant README

💻 **Let's Build!** 🎮
