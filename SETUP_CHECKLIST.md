# ✅ Setup Checklist - Track Your Progress

Follow this checklist to ensure you set up WebWorlds completely! Print it or use it as a reference.

---

## 🔷 SECTION 1: Prerequisites (5 min)

- [ ] Node.js v18+ installed
  ```bash
  node --version    # Should show v18+
  ```
  
- [ ] npm 8+ installed
  ```bash
  npm --version     # Should show 8+
  ```

- [ ] Git installed
  ```bash
  git --version
  ```

- [ ] Docker installed (optional, but recommended)
  ```bash
  docker --version
  ```

- [ ] GitHub account created (for production)
- [ ] Railway account created (for production)
- [ ] Vercel account created (for production)

---

## 🔷 SECTION 2: Code Setup (3 min)

- [ ] Fork/clone project to `c:\Users\fadhi\WebWorlds`
- [ ] Frontend folder exists at `backend/src/`
- [ ] Backend folder exists at `backend/`

### Verify Structure:
```
WebWorlds/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── README.md
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env.example
└── *.md (docs)
```

---

## 🔷 SECTION 3: Backend Setup (10 min)

### 3.1 Install Dependencies
- [ ] ```bash
  cd backend
  npm install
  ```
  Output: "added XXX packages"

### 3.2 Environment Variables
- [ ] Copy `.env.example` to `.env.local`
  ```bash
  copy .env.example .env.local
  ```

- [ ] `.env.local` file exists with:
  - [ ] `MONGODB_URI=mongodb://localhost:27017/webworlds`
  - [ ] `JWT_SECRET=test-key-local` (for local testing)
  - [ ] `PORT=5000`
  - [ ] `NODE_ENV=development`

### 3.3 Database Setup

**Choose Option A, B, or C:**

**Option A: Docker (Easiest)**
- [ ] Docker installed and running
- [ ] ```bash
  cd backend
  docker-compose up -d
  ```
- [ ] MongoDB container running
  ```bash
  docker ps
  # Should show: webworlds-mongodb, webworlds-mongo-express
  ```
- [ ] MongoDB accessible at `mongodb://admin:admin@localhost:27017`
- [ ] MongoDB Express UI at http://localhost:8081

**Option B: Manual MongoDB**
- [ ] MongoDB installed locally
- [ ] MongoDB service running
  ```bash
  mongod
  ```
- [ ] MongoDB listening on port 27017

**Option C: MongoDB Atlas Cloud**
- [ ] Atlas account created
- [ ] Free cluster created
- [ ] Connection string in `.env.local`:
  ```env
  MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/webworlds
  ```

### 3.4 Database Initialization
- [ ] Collections created
  ```bash
  npm run db:init
  # Output: ✅ Database initialization complete!
  ```

- [ ] (Optional) Demo data seeded
  ```bash
  npm run db:seed
  # Output: ✅ Database seeding complete!
  ```

---

## 🔷 SECTION 4: Frontend Setup (5 min)

### 4.1 Install Dependencies
- [ ] ```bash
  cd frontend
  npm install --legacy-peer-deps
  ```
  Output: "added XXX packages"

### 4.2 Environment Variables
- [ ] `.env.local` or `.env.development.local` created in frontend

- [ ] Contains:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000
  ```

---

## 🔷 SECTION 5: Start Servers (Local Development)

### 5.1 Terminal 1: Backend

- [ ] Terminal open in `backend` folder
- [ ] Run:
  ```bash
  npm run dev
  ```
- [ ] Output shows:
  ```
  ✅ MongoDB connected
  🚀 WebWorlds Backend Running
  📍 Port: 5000
  ```
- [ ] Leave running (don't close terminal)

### 5.2 Terminal 2: Frontend

- [ ] New terminal open in `frontend` folder
- [ ] Run:
  ```bash
  npm run dev
  ```
- [ ] Output shows:
  ```
  ▲ Next.js 16.1.6
  - Local: http://localhost:3000
  ✓ Ready
  ```
- [ ] Leave running (don't close terminal)

---

## 🔷 SECTION 6: Local Testing (10 min)

### 6.1 Backend Health Check

- [ ] Open http://localhost:5000/health
- [ ] See response:
  ```json
  {"status":"ok","timestamp":"...","environment":"development"}
  ```

### 6.2 API Documentation

- [ ] Open http://localhost:5000/api
- [ ] See endpoint list with authentication and games endpoints

### 6.3 Frontend Loads

- [ ] Open http://localhost:3000
- [ ] Page loads without white screen
- [ ] No errors in browser console (F12 → Console)
- [ ] Navbar visible with "Browse Games", "Create a Game"

### 6.4 Complete User Flow

- [ ] Click "Sign Up"
- [ ] Fill form:
  - [ ] Username: `localtest`
  - [ ] Email: `local@test.com`
  - [ ] Password: `LocalTest123`
- [ ] Click "Create Account"
- [ ] Redirected to login
- [ ] Login with credentials
- [ ] Dashboard loads
- [ ] Click "Browse Games"
  - [ ] If seeded, see demo games
  - [ ] Counter shows "0 games" if not seeded
- [ ] Click "Create a Game"
- [ ] Editor opens with code area and preview
- [ ] Type in code editor
- [ ] Click "Preview" → code runs
- [ ] Click "Save"
- [ ] Success message shows

---

## 🔷 SECTION 7: Git & Repository (5 min)

**For Production Deployment:**

- [ ] GitHub account active
- [ ] Git configured locally:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```

- [ ] Repository initialized:
  ```bash
  cd c:\Users\fadhi\WebWorlds
  git init
  git add .
  git commit -m "Initial: WebWorlds frontend and backend"
  ```

- [ ] GitHub repo created at github.com

- [ ] Connected and pushed:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/webworlds.git
  git branch -M main
  git push -u origin main
  ```

- [ ] Repo visible on GitHub with all files

---

## 🔷 SECTION 8: Production Deployment (15 min)

**Only if you want to go live:**

### 8.1 Railway Deployment

- [ ] GitHub repo pushed (Step 7 complete)
- [ ] Railway account created
- [ ] Railway project created
  - [ ] "New Project" → "Deploy from GitHub"
  - [ ] Selected `webworlds` repo
  - [ ] Selected `backend` as root directory
- [ ] Backend deployed and running
- [ ] MongoDB plugin added to Railway
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `JWT_SECRET=<generate-new>`
  - [ ] `CORS_ORIGIN=https://webworlds-YOUR_NAME.vercel.app`
- [ ] Backend URL obtained: `https://your-backend.railway.app`
- [ ] Health check passes:
  ```bash
  curl https://your-backend.railway.app/health
  ```

### 8.2 Vercel Deployment

- [ ] Vercel account created
- [ ] Frontend project created
  - [ ] "New Project" → "Import Git Repository"
  - [ ] Selected `webworlds` repo
  - [ ] Selected `frontend` as root directory
- [ ] Environment variable set:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.railway.app
  ```
- [ ] Frontend deployed
- [ ] Frontend URL obtained: `https://webworlds-YOUR_NAME.vercel.app`
- [ ] Frontend loads at URL
- [ ] Can access in browser

### 8.3 Connect Frontend ↔ Backend

- [ ] Update Railway backend CORS:
  ```
  CORS_ORIGIN=https://webworlds-YOUR_NAME.vercel.app
  ```
- [ ] Backend redeployed automatically
- [ ] Frontend updated if needed:
  ```bash
  git push  # Triggers redeploy
  ```
- [ ] No CORS errors in browser console

### 8.4 Production Testing

- [ ] Frontend URL loads without errors
- [ ] Sign up new account
  - [ ] Username: `prodtest`
  - [ ] Email: `prod@test.com`
  - [ ] Password: `ProdTest123`
- [ ] Login with credentials
- [ ] Create a game
- [ ] Publish game
- [ ] Find game in "Browse Games"
- [ ] Like/unlike game works
- [ ] All data persists on refresh

---

## 🔷 SECTION 9: Documentation Review

Make sure you've read critical docs:

- [ ] [MAIN_SETUP.md](MAIN_SETUP.md) - Complete setup guide
- [ ] [backend/README.md](backend/README.md) - API reference
- [ ] [frontend/README.md](frontend/README.md) - Frontend guide
- [ ] [DEPLOYMENT_RAILWAY.md](DEPLOYMENT_RAILWAY.md) - Deploy guide
- [ ] [plan.md](plan.md) - Architecture overview

---

## 🔷 SECTION 10: Troubleshooting

### Issue: Port already in use

- [ ] Check what's using port 5000:
  ```bash
  netstat -ano | findstr :5000
  ```
- [ ] Kill the process:
  ```bash
  taskkill /PID {PID} /F
  ```

### Issue: MongoDB connection failed

- [ ] Check Docker is running:
  ```bash
  docker ps
  ```
- [ ] Restart if needed:
  ```bash
  docker-compose restart mongodb
  ```
- [ ] Or check manual MongoDB service

### Issue: npm install fails

- [ ] Clear cache:
  ```bash
  npm cache clean --force
  ```
- [ ] Delete node_modules and lock file:
  ```bash
  rm -r node_modules package-lock.json
  ```
- [ ] Fresh install:
  ```bash
  npm install
  ```

### Issue: Frontend shows white screen

- [ ] Open browser console (F12)
- [ ] Check for errors
- [ ] Restart frontend server
- [ ] Clear browser cache

### Issue: Cannot connect to backend

- [ ] Check backend is running on port 5000
- [ ] Check `NEXT_PUBLIC_API_URL` is correct
- [ ] Check CORS_ORIGIN in backend matches frontend URL

---

## 🎉 COMPLETION!

Once you've checked all boxes:

- [ ] Backend running locally ✅
- [ ] Frontend running locally ✅
- [ ] Database initialized ✅
- [ ] User can register ✅
- [ ] User can create games ✅
- [ ] No errors in console ✅
- [ ] Tests pass ✅
- [ ] (Optional) Published to production ✅

**You're officially done!** 🚀

---

## 📊 Final Summary

| Component | Local | Production |
|-----------|-------|------------|
| **Frontend** | http://localhost:3000 | https://webworlds-YOUR_NAME.vercel.app |
| **Backend** | http://localhost:5000 | https://your-backend.railway.app |
| **Database** | Docker/Local MongoDB | MongoDB (Railway) |
| **Status** | ✅ Running | ✅ Live |

---

## 🆘 Still Need Help?

1. Check error message in console
2. Review relevant README
3. Check [DEPLOYMENT_RAILWAY.md](DEPLOYMENT_RAILWAY.md)
4. Review [BACKEND_SETUP.md](BACKEND_SETUP.md)

Everything should work - if not, all the info you need is in documentation!

---

**Print this checklist and check off as you go!**

**Status: 🟢 READY**

**Happy building! 🎮**
