# ⚡ Quick Start Checklist - Railway Deployment

## 📋 Ringkas 10 Langkah Deployment

### ✅ 1. PERSIAPAN LOKAL
- [ ] Clone repo dari GitHub
- [ ] `npm install` di backend & frontend
- [ ] Setup `.env.local` dari `.env.example`
- [ ] Test: `npm run dev` backend & frontend

### ✅ 2. SETUP MONGODB ATLAS
- [ ] Create MongoDB account & cluster
- [ ] Create database user: `webworlds`
- [ ] Whitelist IP: `0.0.0.0/0`
- [ ] Copy MongoDB URI string

### ✅ 3. GITHUB SETUP
- [ ] Push semua code ke GitHub
- [ ] Verifikasi repo public/private sesuai
- [ ] Tidak ada API keys/secrets di repo

### ✅ 4. RAILWAY BACKEND DEPLOY
- [ ] Login Railway dengan GitHub
- [ ] Deploy dari repo WebWorlds
- [ ] Set RAILWAY VARIABLES:
  ```
  NODE_ENV=production
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=random-32-chars
  CORS_ORIGIN=https://frontend-url.com
  ```
- [ ] Deploy success → copy URL
  - Contoh: `webworlds-api.railway.app`

### ✅ 5. VERCEL FRONTEND DEPLOY
- [ ] Login Vercel dengan GitHub
- [ ] Import project WebWorlds
- [ ] Set VERCEL VARIABLES:
  ```
  NEXT_PUBLIC_API_URL=https://webworlds-api.railway.app/api
  NEXT_PUBLIC_SOCKET_URL=https://webworlds-api.railway.app
  ```
- [ ] Deploy → copy URL
  - Contoh: `webworlds.vercel.app`

### ✅ 6. UPDATE CORS
- [ ] Railway: update `CORS_ORIGIN=https://webworlds.vercel.app`
- [ ] Redeploy backend di Railway

### ✅ 7. TEST ENDPOINTS
- [ ] ✓ Health: `GET /health`
- [ ] ✓ Register: `POST /api/auth/register`
- [ ] ✓ Login: `POST /api/auth/login`
- [ ] ✓ Socket: WebSocket connection

### ✅ 8. TEST FRONTEND
- [ ] Signup berhasil
- [ ] Login berhasil
- [ ] Create game berhasil
- [ ] Real-time update kerja

### ✅ 9. CI/CD SETUP
- [ ] GitHub push → Railway auto-deploy backend
- [ ] GitHub push → Vercel auto-deploy frontend
- [ ] Test dengan push dummy change

### ✅ 10. MONITORING
- [ ] Setup logs di Railway
- [ ] Monitor uptime via dashboard
- [ ] Backup MongoDB Atlas aktif

---

## 🔗 ENVIRONMENT VARIABLES REFERENCE

### Backend (.env.local atau Railway)
```
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=<32-char-random-string>
CORS_ORIGIN=https://your-frontend.com
```

### Frontend (.env.local atau Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

---

## 🚨 COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| `MODULE_NOT_FOUND: dotenv` | ✅ Fixed! Railway sekarang auto-install deps |
| CORS Error di frontend | Set `CORS_ORIGIN` = frontend URL di Railway |
| WebSocket tidak connect | Tunggu redeploy selesai, clear cache browser |
| 502 Bad Gateway | Check Railway logs, verifikasi build success |
| Database connection timeout | Whitelist IP di MongoDB Atlas ke `0.0.0.0/0` |

---

## 📞 SUPPORT LINKS

- 📖 Full Guide: [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)
- 🚀 Railway Docs: https://docs.railway.app
- ▲ Vercel Docs: https://vercel.com/docs
- 🍃 MongoDB: https://docs.mongodb.com
- ⚡ Next.js: https://nextjs.org/docs

---

## ⏱️ Estimated Timeline

- Setup MongoDB Atlas: **5 menit**
- Deploy Railway Backend: **10 menit**
- Deploy Vercel Frontend: **5 menit**
- Configuration & Testing: **10 menit**
- **Total: ~30 menit** ✅
