# 🎯 Step-by-Step Commands - copy paste ready!

## TAHAP 1: SETUP LOKAL (Jika belum ada)

### Clone repo
```bash
git clone https://github.com/FadhilAkbarC/WebWorlds.git
cd WebWorlds
```

### Install dependencies
```bash
# Backend
cd backend
npm install --legacy-peer-deps
cd ..

# Frontend
cd frontend
npm install --legacy-peer-deps
cd ..
```

### Setup environment lokal
```bash
# Backend
cp backend/.env.example backend/.env.local

# Edit backend/.env.local dan set:
# NODE_ENV=development
# MONGODB_URI=mongodb://localhost:27017/webworlds
# JWT_SECRET=test-secret-key-at-least-32-chars-long
# CORS_ORIGIN=http://localhost:3000
```

### Test lokal
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Tunggu sampai ada "🚀 WebWorlds Backend Server Running"

# Terminal 2 - Frontend (buka terminal baru)
cd frontend
npm run dev
# Akses http://localhost:3000
```

---

## TAHAP 2: GITHUB PUSH

```bash
# Dari root directory
git status
git add .
git commit -m "Update deployment configuration"
git push origin main
```

---

## TAHAP 3: MONGODB ATLAS SETUP

1. **Buka:** https://www.mongodb.com/cloud/atlas
2. **Register/Login** dengan email
3. **Create Organization** (atau skip jika sudah ada)
4. **Create Project** → nama: `WebWorlds`
5. **Create Database** 
   - Deployment type: Shared
   - Provider: AWS
   - Region: ap-southeast-1 (Singapore)
   - Cluster Name: `webworlds-cluster`
   - Click "Create Deployment"

6. **Tunggu ~10 menit** sampai cluster aktif

7. **Access Control → Database Access**
   - Username: `webworlds`
   - Password: **GENERATE & SIMPAN AMAN**
   - Role: `readWriteAnyDatabase`
   - Click "Add User"

8. **Network Access**
   - Click "Add IP Address"
   - Click "Allow access from anywhere"
   - Confirm `0.0.0.0/0`

9. **Dapatkan Connection String**
   - Klik "Drivers" / "Connect"
   - Copy URI string: `mongodb+srv://webworlds:PASSWORD@cluster...`
   - **Simpan Connection String ini!**

---

## TAHAP 4: RAILWAY BACKEND DEPLOYMENT

### 4.1 Create Railway Account
1. Kunjungi: https://railway.app
2. **Click "Start for Free"**
3. Login dengan GitHub
4. **Authorize Railway access**

### 4.2 Deploy Repo
1. Dashboard → **"+ New Project"**
2. **"Deploy from GitHub repo"**
3. Search & select: **FadhilAkbarC/WebWorlds**
4. Pilih branch: **main**
5. **Railway auto-detect** dan mulai build
6. Tunggu sampai build selesai (hijau ✅)

### 4.3 Configure Backend Service
```bash
# Di Railway Dashboard, service backend:

# Variables tab - SET SEMUA INI:
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://webworlds:PASSWORD@cluster0.mongodb.net/webworlds?retryWrites=true&w=majority
JWT_SECRET=generate-random-string-min-32-chars-use: openssl rand -base64 32
CORS_ORIGIN=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

⚠️ **IMPORTANT:** 
- Replace `PASSWORD` dengan password MongoDB user
- Replace `CORS_ORIGIN` dengan frontend URL (nanti setelah Vercel deploy)

### 4.4 Railway Settings
1. Settings → Deploy
2. **Build Command:** (leave default atau set)
   ```
   npm ci --omit=dev && npm run build
   ```
3. **Start Command:** (Railway auto-detect, atau set manual)
   ```
   npm start
   ```
4. Click "Save"

### 4.5 Verify Backend
1. Buka Logs tab
2. Cari message: `🚀 WebWorlds Backend Server Running`
3. Copy public domain (contoh: `webworlds-prod-xxxx.railway.app`)
4. Test health endpoint:
   ```bash
   curl https://YOUR-RAILWAY-DOMAIN/health
   # Should return: {"status":"ok",...}
   ```

---

## TAHAP 5: VERCEL FRONTEND DEPLOYMENT

### 5.1 Connect Vercel
1. Kunjungi: https://vercel.com
2. Click **"Sign Up"** → Login dengan GitHub
3. Click **"Import Project"**
4. Paste repo URL atau select dari list:
   ```
   https://github.com/FadhilAkbarC/WebWorlds
   ```
5. Click **"Import"**
6. **Configure:** Framework = Next.js (auto-detect)
7. **Root Directory:** `./frontend`

### 5.2 Environment Variables
Sebelum deploy, set variables:
```
NEXT_PUBLIC_API_URL = https://webworlds-prod-xxxx.railway.app/api
NEXT_PUBLIC_SOCKET_URL = https://webworlds-prod-xxxx.railway.app
```

Replace `webworlds-prod-xxxx.railway.app` dengan Railway domain Anda

### 5.3 Deploy
1. Click **"Deploy"**
2. Tunggu build selesai (~5 menit)
3. Buka deployment URL dari Vercel
4. Test signup → login

### 5.4 Get Vercel URL
- Copy domain dari Vercel dashboard (contoh: `webworlds.vercel.app`)
- Simpan untuk step berikutnya

---

## TAHAP 6: UPDATE RAILWAY CORS

Sekarang kita tahu frontend URL-nya, update CORS di Railway:

1. **Railway Dashboard → Backend Service**
2. **Variables** → Edit `CORS_ORIGIN`
3. **Ganti dengan:** `https://webworlds.vercel.app` (atau domain Vercel Anda)
4. **Save & Redeploy**
5. Tunggu 2-3 menit sampai backend restart

---

## TAHAP 7: TEST ENDPOINTS

### Test backend health
```bash
curl https://YOUR-RAILWAY-DOMAIN/health

# Expected response:
# {"status":"ok","timestamp":"2024-...","uptime":...}
```

### Test API register
```bash
curl -X POST https://YOUR-RAILWAY-DOMAIN/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123"
  }'

# Expected: {"success":true,"token":"..."}
```

### Test WebSocket lokal
```bash
# Di browser frontend
# DevTools → Console
# Should see: "Socket connected: ..."
```

---

## TAHAP 8: FULL END-TO-END TEST

1. Buka: **https://your-frontend.vercel.app**
2. Click **Sign Up**
   - Username: testuser2
   - Email: test2@example.com
   - Password: Test123!
   - Click **Register**

3. **Login** dengan credential yang baru dibuat

4. **Create Game**
   - Game Name: Test Game
   - Description: Testing deployment
   - Click **Create**

5. **Play** game dan verifikasi:
   - ✅ Game loads
   - ✅ Scoring updates
   - ✅ Real-time data sync

---

## TAHAP 9: SETUP AUTO-DEPLOY

### Railway Auto-Deploy
Railway sudah auto-setup:
- Setiap push ke `main` → auto-build & deploy
- Check Settings → GitHub untuk verify

### Vercel Auto-Deploy
Vercel juga sudah auto-setup:
- Setiap push ke `main` → auto-build
- Preview deployments untuk setiap PR

**Test dengan:**
```bash
# Buat dummy change
echo "# Deployment Test" >> README.md

# Push
git add README.md
git commit -m "Testing auto-deploy"
git push origin main

# Monitor Railway & Vercel dashboard
# Keduanya harus auto-trigger build
```

---

## TAHAP 10: MONITORING SETUP

### Railway Logs
```bash
# Setup log streaming (optional)
# Railway Dashboard → Settings → Connect external logging service
# Pilih: Papertrail, LogDNA, atau Datadog (free tier)
```

### Daily Checks
- [ ] Railway dashboard - check uptime % harus 99%+
- [ ] Vercel dashboard - check build success rate
- [ ] Test login/create game dari frontend
- [ ] Check logs untuk errors

---

## ✅ CHECKLIST FINAL

- [ ] MongoDB Atlas cluster active & connected
- [ ] Backend deployed di Railway ✅
- [ ] Frontend deployed di Vercel ✅
- [ ] CORS configured correctly
- [ ] All env variables set
- [ ] Health endpoint returns 200
- [ ] Auth endpoints working
- [ ] WebSocket connected
- [ ] Full signup → login → game create → play flow works
- [ ] Auto-deploy setup & tested

---

## 🚀 DEPLOYMENT COMPLETE!

### URLs to Share
- **App:** https://your-frontend.vercel.app
- **API:** https://your-backend.railway.app

### Daily Dashboard Checks
1. Railway: https://railway.app/dashboard
2. Vercel: https://vercel.com/dashboard
3. MongoDB Atlas: https://cloud.mongodb.com

### If Something Breaks
1. Check Railway logs for backend errors
2. Check Vercel logs for frontend errors
3. Check MongoDB Atlas network status
4. **Debug locally first** before pushing

---

## 💡 MAINTENANCE TIPS

```bash
# Update dependencies (monthly)
npm update --legacy-peer-deps

# Check for security issues
npm audit

# Run tests before deploy
npm test

# Push to main untuk auto-deploy
git push origin main
```

**Good luck! 🎉**
