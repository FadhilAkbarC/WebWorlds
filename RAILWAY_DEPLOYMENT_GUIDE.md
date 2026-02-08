# 📚 Panduan Lengkap Deploy WebWorlds ke Railway.com

## 🎯 Target Akhir Deployment
- Backend API berjalan di Railway
- Frontend berjalan di Vercel atau Railway
- MongoDB Atlas terkoneksi
- Real-time Socket.io berfungsi
- GitHub automatic deployment terkonfigurasi

---

## ✅ LANGKAH 1: Persiapan Lokal (Jika Belum Ada)

### 1.1 Clone Repository
```bash
git clone https://github.com/your-username/WebWorlds.git
cd WebWorlds
```

### 1.2 Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 1.3 Konfigurasi Environment Lokal
```bash
# Backend - Buat .env.local dari .env.example
cp backend/.env.example backend/.env.local

# Isi dengan:
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017/webworlds
JWT_SECRET=your-secret-key-min-32-chars
CORS_ORIGIN=http://localhost:3000
```

### 1.4 Test Lokal
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Akses http://localhost:3000
```

---

## 🔧 LANGKAH 2: Setup Database MongoDB Atlas

### 2.1 Buat Akun MongoDB Atlas
1. Kunjungi https://www.mongodb.com/cloud/atlas
2. Register/Login
3. Create Organization → Create Project

### 2.2 Buat Database Cluster
1. Click "Create Deployment"
2. Pilih "Shared" (gratis)
3. Pilih region terdekat (contoh: Singapore)
4. Create Cluster
5. Tunggu ~10 menit

### 2.3 Setup Database User
1. Security → Database Access
2. Add New Database User
   - Username: `webworlds`
   - Password: generate strong password
   - Role: `readWriteAnyDatabase`
3. Add User

### 2.4 Whitelist Network
1. Security → Network Access
2. Add IP Address
3. Allow access from anywhere: `0.0.0.0/0`
   (Untuk production, batasi ke Railway IP)

### 2.5 Dapatkan Connection String
1. Deployment → Drivers
2. Copy connection string (URI format)
3. Replace password & dbname
```
mongodb+srv://webworlds:PASSWORD@cluster.mongodb.net/webworlds?retryWrites=true&w=majority
```

---

## 🐙 LANGKAH 3: Setup GitHub Repository

### 3.1 Push ke GitHub Jika Belum
```bash
# Jika belum ada repo
git init
git add .
git commit -m "Initial commit: WebWorlds project"
git branch -M main
git remote add origin https://github.com/your-username/WebWorlds.git
git push -u origin main
```

### 3.2 Verifikasi Repository
1. Kunjungi https://github.com/your-username/WebWorlds
2. Pastikan semua file sudah ada
3. Pastikan tidak ada private keys di GitHub

---

## 🚀 LANGKAH 4: Deploy Backend ke Railway

### 4.1 Create Railway Account
1. Kunjungi https://railway.app
2. Login dengan GitHub
3. Authorize Railway

### 4.2 Deploy Backend dari GitHub
1. Dashboard Railway → "+ New Project"
2. "Deploy from GitHub repo"
3. Select repository: `WebWorlds`
4. Railway akan auto-detect dan membuat deployment

### 4.3 Konfigurasi Environment Variables
1. Di Railway Dashboard, pilih project
2. Go to "Variables" tab
3. Add environment variables:

```
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://webworlds:PASSWORD@cluster.mongodb.net/webworlds?retryWrites=true&w=majority
JWT_SECRET=your-secret-min-32-chars-generate-random
CORS_ORIGIN=https://your-frontend-url.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 4.4 Konfigurasi Build & Deploy
1. Di Railway, buka service "backend"
2. Settings → Deploy
3. Build Command: 
   ```
   cd backend && npm ci --omit=dev && npm run build
   ```
4. Start Command:
   ```
   cd backend && node dist/server.js
   ```

### 4.5 Monitor Logs
1. Railway Dashboard → Logs
2. Tunggu sampai muncul "Server Running"
3. Jika error, check logs untuk troubleshoot

### 4.6 Dapatkan Backend URL
1. Di Railway, buka Environment
2. Cari `RAILWAY_PUBLIC_DOMAIN` atau domain yang digenerate
3. Contoh: `webworlds-backend-production.railway.app`

---

## 🎨 LANGKAH 5: Deploy Frontend ke Vercel

### 5.1 Connect ke Vercel
1. Kunjungi https://vercel.com
2. Login dengan GitHub
3. Import Project → Select `WebWorlds`
4. Framework: Next.js (auto-detect)

### 5.2 Konfigurasi Environment Variables
Di Vercel settings, add:

```
NEXT_PUBLIC_API_URL=https://webworlds-backend-production.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://webworlds-backend-production.railway.app
```

### 5.3 Deploy
1. Click "Deploy"
2. Tunggu build selesai (~5 menit)
3. Visit site di Vercel dashboard

### 5.4 Dapatkan Frontend URL
- Contoh: `webworlds-production.vercel.app`

---

## ⚙️ LANGKAH 6: Update CORS di Backend

### 6.1 Update Railway Variables
Kembali ke Railway Backend:
1. Variables → edit `CORS_ORIGIN`
2. Ubah dari `http://localhost:3000` ke:
   ```
   https://webworlds-production.vercel.app
   ```
3. Trigger redeploy

---

## 🧪 LANGKAH 7: Testing & Verification

### 7.1 Test Backend Health
```bash
curl https://webworlds-backend-production.railway.app/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}
```

### 7.2 Test API Auth
```bash
# Register
curl -X POST https://webworlds-backend-production.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "email":"test@example.com",
    "password":"testpass123"
  }'

# Expected: {"success":true,"token":"..."}
```

### 7.3 Test WebSocket Connection
1. Buka frontend URL di browser
2. Open DevTools → Console
3. Cek apakah ada error tentang Socket.io
4. Harus ada message "Socket connected"

### 7.4 Test End-to-End
1. Buka https://webworlds-production.vercel.app
2. Test signup
3. Test login
4. Test create game
5. Test real-time features

---

## 📊 LANGKAH 8: Monitoring & Maintenance

### 8.1 Raw Logs Setup
Railway:
1. Settings → Log Drain
2. Add log service (contoh: Papertrail, LogDNA, atau Datadog)

### 8.2 Monitor Performance
1. Railway Dashboard → Analytics
2. Vercel Dashboard → Analytics
3. Monitor response times, errors, uptime

### 8.3 Database Backup
MongoDB Atlas:
1. Backup & Restore
2. Enable automatic backups
3. Store backup di cloud storage

---

## 🔄 LANGKAH 9: Setup CI/CD & Auto Deploy

### 9.1 Railway Auto Deploy dari GitHub
Sudah tergabung! Setiap push ke `main` branch:
1. Railway auto-detect changes
2. Trigger build
3. Auto-deploy jika success

### 9.2 Vercel Auto Deploy dari GitHub
Juga sudah tergabung! Setiap push:
1. Vercel trigger build
2. Preview deploy untuk PR
3. Production deploy untuk main branch

### 9.3 Matikan Konflik Deploy
Pastikan Railway & Vercel berbeda:
- Railway: Backend (Node.js)
- Vercel: Frontend (Next.js)

---

## 🐛 LANGKAH 10: Troubleshooting

### Issue: 404 di Backend
**Solusi:**
1. Check railway logs
2. Verifikasi `npm ci --omit=dev` berhasil
3. Pastikan `dist/` folder ada
4. Rebuild di Railway

### Issue: CORS Error
**Solusi:**
1. Check `CORS_ORIGIN` di Railway variables
2. Pastikan frontend URL match exactly
3. Clear browser cache
4. Test dengan curl

### Issue: WebSocket Connection Failed
**Solusi:**
1. Check backend logs untuk "Socket.io enabled"
2. Verifikasi `NEXT_PUBLIC_SOCKET_URL` di frontend
3. Clear browser cache
4. Check browser DevTools → Network → WS

### Issue: Database Connection Failed
**Solusi:**
1. Test MONGODB_URI di MongoDB Atlas shell
2. Verifikasi credentials username/password
3. Check network whitelist (0.0.0.0/0 ✅)
4. Add MongoDB diagnostic command:
   ```bash
   npm run db:init
   ```

### Issue: 502 Bad Gateway
**Solusi:**
1. Check build logs di Railway
2. Verify memory usage (need min 512MB)
3. Increase Railway plan jika perlu
4. Check startup time (max 60 sec timeout)

---

## 📋 CHECKLIST DEPLOYMENT

- [ ] MongoDB Atlas account & cluster setup
- [ ] Database user & network whitelist configured
- [ ] GitHub repo created & pushed
- [ ] Railway backend deployed
- [ ] Railway env variables set
- [ ] Vercel frontend deployed
- [ ] Vercel env variables set
- [ ] CORS_ORIGIN updated
- [ ] Backend health endpoint working
- [ ] Auth API working
- [ ] WebSocket connected
- [ ] User can signup/login
- [ ] Games can be created
- [ ] Real-time features working
- [ ] Logs & monitoring setup
- [ ] Auto-deploy from GitHub working

---

## 🎉 Selesai!

Jika semua checklist ✅, deployment berhasil!

### URLs untuk Dipantau:
- **Backend API:** `https://webworlds-backend-production.railway.app`
- **Frontend App:** `https://webworlds-production.vercel.app`
- **Health Check:** `https://webworlds-backend-production.railway.app/health`

### Untuk Maintenance:
1. Jika ada bug → fix → commit → auto deploy
2. Monitor Railway & Vercel dashboards
3. Check MongoDB Atlas backups weekly
4. Scale up jika traffic meningkat

---

## 📞 Support & Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com
- Next.js Docs: https://nextjs.org/docs
- Express.js Docs: https://expressjs.com
