# 🔧 Troubleshooting Guide - WebWorlds

Complete guide to solving common problems. Read the error first, find it below, and try the solutions.

---

## 🆘 Backend Issues

### Backend won't start (Port Error)

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution 1: Kill existing process on port 5000**

Windows:
```bash
netstat -ano | findstr :5000
# Note the PID (last column)
taskkill /PID 12345 /F
# Replace 12345 with actual PID
```

Then restart:
```bash
npm run dev
```

**Solution 2: Use different port**

Edit `.env.local`:
```env
PORT=5001  # Changed from 5000
```

Restart backend.

---

### MongoDB Connection Failed

**Error Message:**
```
MongooseError: Failed to connect to MongoDB
```

**Check 1: Is MongoDB running?**

If using Docker:
```bash
docker ps
# Should show webworlds-mongodb container running
```

Not running? Start it:
```bash
docker-compose up -d
```

**Check 2: Connection string correct?**

`.env.local` should have:

For Docker:
```env
MONGODB_URI=mongodb://admin:admin@localhost:27017/webworlds
```

For Atlas:
```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/webworlds
```

**Check 3: MongoDB credentials**

If using custom setup, verify:
- Username: `admin`
- Password: `admin`
- Database: `webworlds`

**Solution: Restart MongoDB**

```bash
# Option 1: Docker
docker-compose restart mongodb

# Option 2: Manual MongoDB
# Stop mongod process and restart
```

---

### Database Initialization Fails

**Error Message:**
```
❌ Failed to initialize database
Error: cannot create index
```

**Check 1: Database is empty**

```bash
npm run db:reset
# This will clear and reinitialize
```

**Check 2: MongoDB has existing collections**

```bash
# Connect to MongoDB
mongo  # Or: mongosh

# Switch to webworlds database
use webworlds

# Drop all collections
db.dropDatabase()

# Exit
exit
```

Then run:
```bash
npm run db:init
```

---

### API Endpoints Return 500 Errors

**Error Message:**
```json
{
  "error": "Internal Server Error",
  "message": "Cannot read property 'email' of undefined"
}
```

**Solution 1: Check backend console**

Look at terminal where `npm run dev` is running for detailed error logs.

**Solution 2: Verify database is initialized**

```bash
npm run db:init
```

**Solution 3: Clear and reseed**

```bash
npm run db:reset
npm run db:seed
```

---

### JWT Token Expired Error

**Error Message:**
```json
{
  "error": "Unauthorized",
  "message": "Token has expired"
}
```

**Solution 1: Login again**

Sign in with your credentials. New token is issued automatically.

**Solution 2: For local testing**

Edit backend `.env.local`:
```env
JWT_EXPIRES_IN=7d  # Change from default
```

Restart backend.

---

### CORS Error from Frontend

**Error Message in Browser Console:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/games'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Check 1: Backend is running**

```bash
# In backend terminal
npm run dev
# Should show: 🚀 WebWorlds Backend Running
```

**Check 2: Frontend env variable**

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Solution: Restart both servers**

```bash
# Terminal 1 (backend)
npm run dev

# Terminal 2 (frontend)
npm run dev
```

---

### Database Seed Failed - Duplicate Keys

**Error Message:**
```
MongoServerError: E11000 duplicate key error
```

**Solution:**

```bash
# Reset database completely
npm run db:reset

# This runs db:init + db:seed fresh
```

Or manually:
```bash
npm run db:init
npm run db:seed
```

---

## 🆘 Frontend Issues

### Frontend shows white screen

**Solution 1: Check browser console**

Press `F12` → Console tab. Look for errors.

**Solution 2: Backend not connected**

Check:
1. Backend is running on port 5000
2. `NEXT_PUBLIC_API_URL` is correct in `.env.local`
3. No CORS errors

**Solution 3: Node modules issue**

```bash
cd frontend
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

---

### npm install fails with peer dependency warnings

**Error:**
```
npm warn peer tsconfig-paths@4.2.0 requires typescript@...
```

**Solution:**

Use `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

Or update packages:
```bash
npm update
npm install
```

---

### Next.js Build Fails

**Error:**
```
Error: Compilation failed
```

**Solution 1: Clear build cache**

```bash
cd frontend
rm -r .next
npm run build
```

**Solution 2: Clear node modules**

```bash
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

---

### Localhost:3000 doesn't work

**Error:**
```
This site can't be reached
```

**Check:**

1. Frontend is running:
   ```bash
   cd frontend
   npm run dev
   ```

2. It's actually on port 3000:
   ```
   ✓ Ready in X.XXs
   - Local: http://localhost:3000
   ```

3. Try different port:
   ```bash
   npm run dev -- -p 3001
   ```

---

### API calls return 404 Not Found

**Error:**
```
GET /api/games 404
```

**Check:**

1. Backend routes files exist:
   - `backend/src/routes/auth.ts`
   - `backend/src/routes/games.ts`

2. Routes are registered in `src/app.ts`:
   ```typescript
   app.use('/api/auth', authRoutes);
   app.use('/api/games', gameRoutes);
   ```

3. Backend is running and showing routes loaded

---

### Cannot create game - validation error

**Error:**
```json
{
  "error": "Validation failed",
  "message": "Game title must be 3-50 characters"
}
```

**Solution:**

Fill all required fields correctly:
- Title: 3-50 characters
- Description: 10-500 characters
- Width: 320-2560 pixels
- Height: 240-1440 pixels
- FPS: 15-120

---

## 🆘 Deployment Issues

### Railway deployment fails

**Error in Railway logs:**
```
npm install failed
```

**Solution 1: Node version specified**

Create `railway.json`:
```json
{
  "builder": "nixpacks",
  "buildCommand": "npm install --legacy-peer-deps && npm run build"
}
```

**Solution 2: Environment variables missing**

Railway dashboard → Variables → Add all from `.env.example`

**Solution 3: Check logs**

Railway Dashboard → Deployments → View logs

---

### Frontend can't reach deployed backend

**Error in browser console:**
```
CORSError: Cannot reach https://your-backend.railway.app
```

**Solution 1: Update CORS origin**

Railway Dashboard → Backend Project → Variables:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

Redeploy backend.

**Solution 2: Backend URL in frontend**

Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

Redeploy frontend.

---

### Vercel deployment shows error

**Error:**
```
Build failed
```

**Solution:**

1. Check build passes locally:
   ```bash
   npm run build
   ```

2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Fix build"
   git push
   ```

3. Vercel auto-redeploys

4. If still fails, check Vercel logs

---

## 🆘 Database Issues

### "Database not initialized" error

**Error:**
```
❌ Collections not found
```

**Solution:**

```bash
npm run db:init
```

Output should show:
```
✅ Database initialization complete!
Collections created: User, Game, GameSession, Leaderboard
```

---

### Can't see demo data

**Error:**
```
Games list is empty
```

**Solution:**

Seed the database:
```bash
npm run db:seed
```

Should show:
```
✅ Database seeding complete!
Created 3 users and 3 games.
```

---

### Indexes not working (queries slow)

**Solution:**

Indexes are created automatically during `db:init`, but if needed:

```bash
npm run db:init
```

Or delete and recreate:
```bash
npm run db:reset
```

---

## 🆘 Docker Issues

### Docker container won't start

**Error:**
```
Cannot connect to Docker daemon
```

**Solution:**

1. Make sure Docker Desktop is running
2. Try again:
   ```bash
   docker-compose up -d
   ```

---

### Port 27017 already in use (MongoDB)

**Error:**
```
Error response from daemon: Ports are not available
```

**Solution 1: Stop existing container**

```bash
docker-compose down
# Wait 5 seconds
docker-compose up -d
```

**Solution 2: Use different port**

Edit `docker-compose.yml`:
```yaml
services:
  mongodb:
    ports:
      - "27018:27017"  # Changed to 27018
```

Update `.env.local`:
```env
MONGODB_URI=mongodb://admin:admin@localhost:27018/webworlds
```

Restart:
```bash
docker-compose up -d
```

---

### MongoDB Express UI not accessible

**Error:**
```
localhost:8081 refused connection
```

**Solution:**

Check container is running:
```bash
docker ps
# Should show webworlds-mongo-express

# If not, restart:
docker-compose up -d mongo-express
```

---

## 🆘 Git & GitHub Issues

### Cannot push to GitHub

**Error:**
```
Permission denied (publickey)
```

**Solution:**

1. Generate SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your@email.com"
   ```

2. Add to GitHub:
   - GitHub → Settings → SSH and GPG keys
   - Paste public key
   - Add key

3. Try push again:
   ```bash
   git push
   ```

---

### Git merge conflicts

**Error:**
```
CONFLICT (content merge): Merge conflict in file.ts
```

**Solution:**

1. Open file, look for:
   ```
   <<<<<<< HEAD
   your changes
   =======
   their changes
   >>>>>>> branch
   ```

2. Keep what you want, delete markers

3. Save and commit:
   ```bash
   git add .
   git commit -m "Resolve conflicts"
   ```

---

## 🧪 Testing Issues

### Register endpoint returns error

**Error:**
```json
{
  "error": "Username or email already exists"
}
```

**Solution:**

Use new unique credentials:
```json
{
  "username": "newuser_" + Date.now(),
  "email": "user_" + Date.now() + "@example.com",
  "password": "TestPassword123"
}
```

---

### Login fails silently

**Issue:**
Screen shows empty error message.

**Solution:**

1. Check credentials are correct
2. Check user exists:
   ```bash
   # MongoDB
   use webworlds
   db.users.findOne({username: "demo"})
   ```

3. Check password is correct by resigning up

---

## 📋 Common Errors Quick Reference

| Error | Cause | Fix |
|-------|-------|-----|
| EADDRINUSE | Port in use | Kill process or use different port |
| ECONNREFUSED | Backend not running | Start backend: `npm run dev` |
| CORS error | Frontend/backend mismatch | Check env vars |
| 404 error | Route not found | Check routes are registered |
| E11000 | Duplicate data | Reset: `npm run db:reset` |
| ENOMEM | Out of memory | Restart servers |
| Token expired | JWT timeout | Login again |
| White screen | Frontend error | Check console (F12) |

---

## 🔍 Debug Mode

### Enable detailed logging

Backend `.env.local`:
```env
DEBUG=webworlds:*
LOG_LEVEL=debug
```

Restart backend.

### Check API response

```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:5000/api/games -Headers @{"Authorization"="Bearer YOUR_TOKEN"}

# Or use Postman/REST Client
```

### MongoDB shell debugging

```bash
# Connect to MongoDB
mongosh  # or mongo

# Switch database
use webworlds

# Check users created
db.users.find().pretty()

# Check games
db.games.find().pretty()

# Check indexes
db.users.getIndexes()
```

---

## 💡 Pro Tips

1. **Always restart servers after env changes**
2. **Keep two terminals open: one backend, one frontend**
3. **Use mongo-express UI for database debugging**
4. **Check browser console (F12) for frontend errors first**
5. **Check backend terminal for backend errors**
6. **Use `docker-compose logs` to see container output**
7. **Clear browser cache if UI doesn't update**

---

## 📞 Still Stuck?

1. **Read the documentation:**
   - [MAIN_SETUP.md](MAIN_SETUP.md)
   - [backend/README.md](backend/README.md)
   - [frontend/README.md](frontend/README.md)

2. **Check error message carefully** - it usually tells you what's wrong

3. **Try restarting everything:**
   ```bash
   # Kill all Node processes
   taskkill /F /IM node.exe
   
   # Restart servers
   ```

4. **Reset database:**
   ```bash
   npm run db:reset
   ```

---

**Version: 1.0**
**Last Updated: 2024**
**Status: 🟢 Complete**

Everything should work - if not, this guide has your answer!
