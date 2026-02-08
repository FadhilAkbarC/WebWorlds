# 🚀 Railway Deployment Guide

Complete guide to deploying WebWorlds (Frontend + Backend) to Railway and Vercel.

## 📋 Prerequisites

- GitHub account
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- Git installed locally

---

## 🎯 Phase 1: Prepare for Deployment

### 1.1 Create GitHub Repository

```bash
cd c:\Users\fadhi\WebWorlds

# Initialize git if not done
git init
git add .
git commit -m "Initial commit: WebWorlds frontend and backend"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/webworlds.git
git branch -M main
git push -u origin main
```

### 1.2 Update Environment Variables

**Backend `.env.example`** (already prepared):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...  # Will be set by Railway MongoDB plugin
JWT_SECRET=<generate-new>
CORS_ORIGIN=https://yourdomain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate Random JWT Secret**:
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Minimum 0 -Maximum 256)})) -join ''

# Or use OpenSSL (if installed)
openssl rand -base64 32
```

### 1.3 Build Backend for Production

```bash
cd backend
npm run build
```

Should create `/dist` folder with compiled JavaScript.

---

## 🌐 Phase 2: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Click **"Connect GitHub"** and authorize
5. Select your `webworlds` repository
6. Select **`backend`** as root directory
7. Click **"Deploy"**

Railway detects `Node.js` from `package.json` automatically.

### Step 2: Add MongoDB Plugin

1. In Railway dashboard, click **"+ Add"**
2. Search and select **"MongoDB"**
3. Click **"Add"**
4. MongoDB is automatically running and connected

Railway sets `MONGODB_URI` environment variable automatically! ✅

### Step 3: Configure Environment Variables

In Railway dashboard, go to **Variables** tab:

```
NODE_ENV = production
JWT_SECRET = <your-generated-key>
CORS_ORIGIN = https://yourdomain.vercel.app  (set after frontend deployed)
RATE_LIMIT_MAX_REQUESTS = 200
LOG_LEVEL = info
```

### Step 4: Set Deploy Trigger

By default, Railway auto-deploys on every git push.

To verify:
1. Go to **Deployments** tab
2. Push a small commit to trigger:
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push
   ```
3. Watch deployment progress

### Step 5: Get Backend URL

After deployment succeeds:
1. Go to **Settings** tab
2. Find **Domains** section
3. Your backend URL is: `https://your-backend.railway.app`

**Save this URL** - needed for frontend configuration.

---

## 🎨 Phase 3: Deploy Frontend to Vercel

### Step 1: Import Repository to Vercel

1. Go to https://vercel.com
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select your `webworlds` repository
5. Select **`frontend`** as root directory
6. Click **"Import"**

### Step 2: Configure Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables**:

```
NEXT_PUBLIC_API_URL = https://your-backend.railway.app
```

Click **"Save"**

### Step 3: Deploy

Vercel automatically deploys. Wait for success.

### Step 4: Get Frontend URL

After deployment:
1. Go to **Deployments** tab
2. Your frontend URL is: `https://webworlds-yourname.vercel.app`

**Update backend CORS in Railway**:
1. Go to Railway backend project
2. Click **Variables**
3. Update `CORS_ORIGIN` = `https://webworlds-yourname.vercel.app`
4. Redeployment happens automatically

---

## 🧪 Phase 4: Test Deployment

### 4.1 Test Backend

```bash
# Health check
curl https://your-backend.railway.app/health

# API documentation
curl https://your-backend.railway.app/api
```

Response should show server is running.

### 4.2 Test Frontend

Open https://webworlds-yourname.vercel.app in browser.

### 4.3 Test E2E Flow

1. **Register** new account
2. **Login** - token should appear
3. **Browse Games** - should load from backend
4. **Create Game** - should save to database
5. **Publish Game** - should appear in public list
6. **Like Game** - counter should increment

### 4.4 Check Logs

**Backend logs**:
```bash
railway logs  # In backend directory
```

**Frontend logs**:
- Browser developer tools (F12)
- Vercel dashboard → Function Logs

---

## 🔐 Security Checklist

Before going live:

- ✅ JWT_SECRET is strong (32+ random chars)
- ✅ CORS_ORIGIN is exact (no wildcards)
- ✅ MongoDB has username/password
- ✅ HTTPS enabled (automatic on Railway/Vercel)
- ✅ Rate limiting enabled (default 100 req/15min)
- ✅ Helmet.js enabled (security headers)
- ✅ No console.log of sensitive data
- ✅ Error messages don't expose internals
- ✅ .env.local is in .gitignore (not committed)

---

## 📊 Monitoring

### Railway Dashboard

**Deployments**:
- View deploy history
- View build logs
- Rollback if needed

**Metrics**:
- CPU usage
- Memory usage
- Network traffic

**Logs**:
- Real-time logs
- Filter by level (error, warn, info)
- Search functionality

### View Logs

```bash
# Start watching logs
railway logs -f

# Last 100 lines
railway logs --limit 100

# Filter errors
railway logs | grep ERROR
```

---

## 🔄 Continuous Deployment

Every git push auto-deploys:

```bash
# Make code changes
git add .
git commit -m "Feature: add new game category"
git push

# Automatic deployment starts immediately
# View progress: https://railway.app (dashboard)
```

No manual deployment commands needed! ✨

---

## 🆘 Troubleshooting

### Backend deployment fails

**Check build logs**:
```
railway status
railway logs --limit 50
```

**Common issues**:
- Missing dependencies: `npm install` first locally
- TypeScript errors: `npm run type-check`
- Port already in use: Railway handles this

### Frontend shows "Cannot reach backend"

1. Check backend URL in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

2. Redeploy frontend (push to git)

3. Check CORS in backend:
   ```bash
   railway variables | grep CORS_ORIGIN
   ```

### Database connection error

1. Check MongoDB plugin is added to Railway
2. Verify `MONGODB_URI` is set:
   ```bash
   railway variables | grep MONGODB
   ```
3. Restart services in Railway dashboard

### Rate limiting blocking API calls

Increase `RATE_LIMIT_MAX_REQUESTS` in Railway variables:
```
RATE_LIMIT_MAX_REQUESTS = 500  # Up from 100
```

Redeploy backend.

---

## 💰 Cost Analysis

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Railway** | $5/month credit | $0-20/month |
| **Vercel** | Unlimited | $0/month |
| **MongoDB** | Shared tier | Free |
| **Domain** | subdomain | $0/month |
| **Total** | | **$0-20/month** |

Can run entire platform on $5/month Railway credit indefinitely!

---

## 🚀 Scaling Tips

As your platform grows:

1. **Database**: Upgrade MongoDB plan on Railway
2. **Compute**: Increase Railway CPU/memory allocation
3. **Bandwidth**: Vercel handles automatically
4. **CDN**: Already included in both
5. **Cache**: Add Redis plugin on Railway (optional)

No code changes needed - just adjust resources.

---

## 📝 Custom Domain (Optional)

### Add Your Domain

1. **Buy domain** (Namecheap, GoDaddy, etc)
2. **Point to Vercel**:
   - Vercel dashboard → Settings → Domains
   - Add custom domain
   - Point nameservers to Vercel
3. **Point to Railway** (optional for backend):
   - Railway → Settings → Domains
   - Add custom domain

Examples:
- Frontend: `www.webworlds.com` (Vercel)
- Backend: `api.webworlds.com` (Railway)

---

## 🎉 You're Live!

Your WebWorlds platform is running:

- 🎨 **Frontend**: https://webworlds-yourname.vercel.app
- 🚀 **Backend**: https://your-backend.railway.app
- 💾 **Database**: MongoDB (Railway)
- 🔐 **SSL/HTTPS**: Automatic
- 🌍 **Global CDN**: Automatic
- 📈 **Auto-scaling**: Vercel + Railway handle it
- 💯 **Uptime**: 99.9%

---

## 🔗 Quick Links

- [Railway Dashboard](https://railway.app/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repository](https://github.com/yourusername/webworlds)
- [API Documentation](./backend/README.md)
- [Frontend README](./frontend/README.md)

---

## 📚 More Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Express.js](https://expressjs.com)
- [Next.js](https://nextjs.org)
- [MongoDB Atlas](https://mongodb.com/cloud/atlas)

---

**Status**: 🟢 Production Ready  
**Last Updated**: February 8, 2026  
**Next**: Promote to users and iterate!
