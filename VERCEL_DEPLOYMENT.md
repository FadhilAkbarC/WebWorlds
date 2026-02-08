# Vercel Deployment Guide - Step by Step

## Quick Setup (5 minutes)

This file guides you through deploying the frontend to Vercel.

### Prerequisites
- Vercel account (free tier at https://vercel.com)
- GitHub account with WebWorlds repo already pushed
- Railway backend URL (from Step 2 deployment)

---

## Step-by-Step Instructions

### 1. Connect to Vercel
1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### 2. Import Project
1. Click **"New Project"** (or "Add New..." → "Project")
2. Find and click **WebWorlds** repository
   - If not visible, click "Import Third-Party Git Repository" and enter: `https://github.com/FadhilAkbarC/WebWorlds`

### 3. Configure Project
1. **Project Name**: `webworlds-frontend` (or your choice)
2. **Select Framework**: Should auto-detect as **Next.js**
3. **Root Directory**: Click **"Edit"** and set to `frontend`
   - This is critical!
4. Click **"Deploy"**

Vercel will start building. Wait ~3-5 minutes.

### 4. Add Environment Variables (After First Deploy)
After deployment completes:

1. Go to your project's **Settings** tab
2. Click **"Environment Variables"** (left sidebar)
3. Add this variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-backend-url.railway.app/api`
     - Replace `your-railway-backend-url` with your actual Railway domain
   - **Environments**: Select `Production`, `Preview`, and `Development`
4. Click **"Save"**

### 5. Redeploy with Environment Variable
1. Go back to **"Deployments"** tab
2. Click the three dots (...) on the latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

Done! Your frontend is now live with API connection to your backend.

---

## Your URLs

After successful deployment, you'll have:

| Service | URL |
|---------|-----|
| **Frontend** | https://webworlds-xxx.vercel.app |
| **Backend API** | https://webworlds-backend-xxx.railway.app |
| **API Docs** | https://webworlds-backend-xxx.railway.app/api/docs |

---

## Troubleshooting

### Build fails with "Module not found"
- Check `frontend/package-lock.json` is committed
- Rebuild in Vercel: Settings → Deployments → Redeploy

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS is enabled in backend
- Test API directly: https://your-backend-url/api/health

### Build takes too long
- Normal for first build (2-3 min)
- Check for large assets in `frontend/public/`

---

## Next Steps After Deployment

1. Test the app: Click the deployment URL
2. Try login, signup, and game features
3. Check browser console for any API errors
4. Monitor Vercel Analytics dashboard

Enjoy your live app! 🚀
