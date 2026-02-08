# ⚡ Quick Reference - WebWorlds Commands & Tasks

Get things done fast with this quick lookup guide.

---

## 🚀 Getting Started (First Time)

```bash
# 1. Enable Python environment (Windows)
configure_python_environment

# 2. Clone/enter the project
cd c:\Users\fadhi\WebWorlds

# 3. Install backend
cd backend
npm install

# 4. Setup Docker MongoDB (easiest)
docker-compose up -d

# 5. Initialize database
npm run db:init

# 6. Seed demo data (optional)
npm run db:seed

# 7. Start backend
npm run dev

# In new terminal:
# 8. Install frontend
cd frontend
npm install --legacy-peer-deps

# 9. Start frontend
npm run dev

# Open http://localhost:3000 in browser
```

---

## 📁 File Structure Quick Jump

```
WebWorlds/
├── MAIN_SETUP.md                 ← Start here for setup
├── SETUP_CHECKLIST.md            ← Track your progress
├── API_DOCUMENTATION.md          ← API endpoints reference
├── TROUBLESHOOTING_GUIDE.md      ← Fix errors fast
├── FEATURES_ROADMAP.md           ← Future features
├── QUICK_REFERENCE.md            ← You are here
│
├── frontend/                      ← React/Next.js app
│   ├── src/app/                   ← Pages & components
│   ├── src/hooks/                 ← Custom hooks
│   ├── src/store/                 ← Zustand stores
│   └── package.json               ← Dependencies
│
├── backend/                       ← Express.js server
│   ├── src/
│   │   ├── routes/                ← API endpoints
│   │   ├── controllers/           ← Business logic
│   │   ├── models/                ← Database models
│   │   ├── middleware/            ← Middleware functions
│   │   ├── config/                ← Configuration
│   │   └── utils/                 ← Helpers
│   ├── package.json               ← Dependencies
│   └── docker-compose.yml         ← MongoDB setup
│
└── docs/                          ← All documentation
```

---

## 🏃 Common Commands

### Backend Commands

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production server
npm run start

# Initialize database (create collections & indexes)
npm run db:init

# Seed database with demo data
npm run db:seed

# Reset database (init + seed)
npm run db:reset

# Check TypeScript
npm run type-check

# Format code
npm run format
```

### Frontend Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Format code
npm run format
```

### Docker Commands

```bash
# Start MongoDB with Docker
docker-compose up -d

# Stop MongoDB
docker-compose down

# View logs
docker-compose logs -f

# Restart MongoDB
docker-compose restart

# View MongoDB Express UI
# Open http://localhost:8081
```

### Git Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push

# Create new branch
git checkout -b feature/name

# Switch branch
git checkout main
```

---

## 📊 Ports & URLs

### Local Development

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React app |
| Backend | http://localhost:5000 | API server |
| MongoDB | mongodb://localhost:27017 | Database |
| MongoDB Express | http://localhost:8081 | DB UI (admin/admin) |

### Production

| Service | URL |
|---------|-----|
| Frontend | https://webworlds-USERNAME.vercel.app |
| Backend | https://webworlds-XXXX.railway.app |
| Database | MongoDB Atlas |

---

## 🔑 Environment Variables

### Backend (.env.local)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/webworlds

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

---

## 🔐 Demo Credentials

After running `npm run db:seed`:

```
User 1:
Username: demo
Email: demo@example.com
Password: demo123

User 2:
Username: testcreator
Email: creator@example.com
Password: creator123
```

**Create Your Own:**
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill form with unique credentials
4. Login and create games

---

## 📝 Create Your First Game

1. **Login** to http://localhost:3000
2. Click **"Create a Game"**
3. Use the code editor:
   ```javascript
   const canvas = document.getElementById('gameCanvas');
   const ctx = canvas.getContext('2d');
   
   // Draw rectangle
   ctx.fillStyle = 'blue';
   ctx.fillRect(50, 50, 100, 100);
   
   // Handle click
   document.addEventListener('click', (e) => {
     console.log('Clicked at:', e.x, e.y);
   });
   ```
4. Click **"Preview"** to test
5. Click **"Save"** to save
6. Click **"Publish"** to share

---

## 🐛 Debug Mode

### Backend Logging

```bash
# Set environment variable
set DEBUG=webworlds:*
npm run dev

# Or in .env.local
DEBUG=webworlds:*
LOG_LEVEL=debug
```

### Frontend Debugging

Press `F12` in browser:
- Console: See errors and logs
- Network: See API requests
- Application: Check localStorage, cookies
- React DevTools: Inspect components

### Database Debugging

```bash
# Connect to MongoDB
mongosh

# Switch database
use webworlds

# View users
db.users.find().pretty()

# View games
db.games.find().pretty()

# Count documents
db.users.countDocuments()

# Clear collection
db.users.deleteMany({})

# Exit
exit
```

---

## 🚀 Deploy to Production

### 1. GitHub

```bash
cd c:\Users\fadhi\WebWorlds
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/webworlds.git
git push -u origin main
```

### 2. Railway Backend

1. Go to railway.app
2. Create new project
3. Import from GitHub
4. Select `webworlds` repo
5. Set root to `/backend`
6. Add MongoDB plugin
7. Set environment variables
8. Deploy!

### 3. Vercel Frontend

1. Go to vercel.com
2. Import GitHub repo
3. Set root to `/frontend`
4. Add env var: `NEXT_PUBLIC_API_URL=<your-railway-url>`
5. Deploy!

**Get URLs:**
- Backend URL: Railway Dashboard → Deployments
- Frontend URL: Vercel Dashboard → Deployments

---

## 📚 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| MAIN_SETUP.md | Complete setup guide (READ FIRST) |
| SETUP_CHECKLIST.md | Track your progress |
| API_DOCUMENTATION.md | All API endpoints |
| FEATURES_ROADMAP.md | What's built & what's next |
| TROUBLESHOOTING_GUIDE.md | Fix errors fast |
| backend/README.md | Backend details |
| frontend/README.md | Frontend details |
| plan.md | Architecture overview |

---

## ⚙️ Configuration Files

### tsconfig.json (TypeScript)
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "commonjs"
  }
}
```

### package.json Scripts
- Edit scripts in `package.json`
- Add custom commands
- Run: `npm run <script-name>`

### .env.example
- Copy to `.env.local`
- Set your values
- Never commit `.env.local`

### docker-compose.yml
- MongoDB configuration
- MongoDB Express UI
- Port mappings
- Health checks

---

## 🔍 Search Commands

```bash
# Find all TypeScript errors
npm run type-check

# Find unused imports
# Use Pylance refactoring tool

# Search in files
grep -r "search-term" src/

# Find large files
ls -lah src/**

# Live search in Git
git log --grep="term"
```

## 💾 Backup & Restore

### Backup Your Work
```bash
# Add to .gitignore (already done)
# All code is in Git + cloud

# Locally:
cp -r . ../WebWorlds_Backup_$(date +%Y%m%d)
```

### Restore from Git
```bash
# See commit history
git log --oneline

# Go back to specific commit
git checkout abc1234

# Undo uncommitted changes
git reset --hard
```

---

## 🎯 Checklists

### Daily Workflow
- [ ] Start servers: `npm run dev`
- [ ] Check for errors: `npm run type-check`
- [ ] Make changes
- [ ] Test locally
- [ ] Commit: `git add . && git commit -m "..."`
- [ ] Push: `git push`

### Before Deployment
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Environment vars correct
- [ ] Database initialized
- [ ] Frontend builds: `npm run build`
- [ ] Backend builds: `npm run build`
- [ ] All files committed

### After Deployment
- [ ] Frontend loads in browser
- [ ] Backend responds to requests
- [ ] Database connected
- [ ] Login works
- [ ] Can create games
- [ ] Can like games
- [ ] No console errors

---

## 🆘 When Things Break

```bash
# Nuclear option - clean everything
rm -r node_modules package-lock.json
npm install
npm run build

# Reset database
npm run db:reset

# Check what's using ports
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID 1234 /F

# Check Docker
docker ps
docker-compose logs

# Check Git status
git status
git diff
```

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| White screen | Check F12 console for errors |
| Can't connect to backend | `npm run dev` backend, check CORS |
| Database connection failed | Check MongoDB is running |
| Port already in use | Kill process or use different port |
| Modules not found | Delete node_modules, run `npm install` |
| TypeScript errors | Run `npm run type-check` |
| Build fails | Clear `.next`, run `npm run build` again |

---

## 🔄 Update Packages

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all
npm update

# Install specific version
npm install package@1.2.3

# Remove package
npm uninstall package-name
```

---

## 📊 Performance Tips

### Frontend
- Use Next.js Image component for images
- Lazy load components: `dynamic(() => import(...))`
- Use React DevTools Profiler
- Check bundle size: `npm run build`

### Backend
- Add database indexes
- Cache frequently accessed data
- Use pagination for lists
- Monitor with `npm run dev`

### Database
- Always create indexes
- Use projection to retrieve only needed fields
- Monitor query performance in MongoDB Express

---

## 🎓 Learning Resources

### Official Docs
- [Next.js](https://nextjs.org/docs)
- [Express.js](https://expressjs.com)
- [MongoDB](https://docs.mongodb.com)
- [Socket.io](https://socket.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### Game Dev
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Game Development](https://gameprogrammingpatterns.com)

---

## ✅ Success Indicators

✅ **Backend Ready When:**
- Port 5000 shows ✅ server started
- MongoDB connected message
- No errors in terminal

✅ **Frontend Ready When:**
- Port 3000 shows "Ready in X.XXs"
- Page loads in browser without white screen
- Console has no errors

✅ **Database Ready When:**
- `npm run db:init` completes successfully
- Can see collections in MongoDB Express
- `npm run db:seed` populates demo data

✅ **Everything Ready When:**
- Can register and login
- Can create and edit games
- Can like/unlike games
- No errors anywhere

---

## 💡 Pro Tips

1. **Use multiple terminals** - one for backend, one for frontend
2. **Keep MongoDB Express open** - easy database browsing
3. **Use VS Code REST Client** for testing APIs
4. **Restart servers after env changes**
5. **Always commit before major changes**
6. **Test locally before deploying**
7. **Read error messages carefully** - they usually tell you what's wrong
8. **Use `npm run build` to test production build locally**

---

## 🎉 You're All Set!

Print this reference card and keep nearby!

**Status: 🟢 READY TO CODE**

**Happy building! 🚀**

---

**Quick Links:**
- 📖 Full Setup: [MAIN_SETUP.md](MAIN_SETUP.md)
- ✅ Track Progress: [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- 🐛 Fix Errors: [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md)
- 📚 API Docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

**Version: 1.0**
**Last Updated: 2024**
