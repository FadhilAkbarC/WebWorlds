# 🚀 WebWorlds Frontend - Quick Start Guide

## ⚡ Get Running in 5 Minutes

### 1️⃣ Start the Dev Server
```bash
cd frontend
npm run dev
```
Visit: **http://localhost:3000**

### 2️⃣ Explore the UI
- **Home** - Hero section & featured games
- **Games** - Browse & search all games
- **Editor** - Create & test games
- **Login/Signup** - Authentication flow
- **Profile** - User dashboard

### 3️⃣ Test Features
✅ Click "Browse Games" to see game listing  
✅ Click "Create a Game" to open the editor  
✅ Search & filter games by category  
✅ Try the game preview (canvas demo)  
✅ Test login/signup forms  

---

## 📁 Important Files to Know

### Pages You Can Edit
```
src/app/page.tsx          → Home page
src/app/games/page.tsx    → Game discovery
src/app/editor/page.tsx   → Game editor
src/app/login/page.tsx    → Login form
```

### State Management (Zustand)
```
src/stores/authStore.ts   → Authentication state
src/stores/gameStore.ts   → Games & discovery
src/stores/editorStore.ts → Game editor state
```

### Your Game Engine
```
src/engine/GameEngine.ts  → 2D rendering engine
src/hooks/useSocket.ts    → Multiplayer support
src/lib/api.ts            → Backend API client
```

---

## 🔧 Environment Setup

### Create .env.local
```bash
cp .env.local.example .env.local
```

### Edit .env.local (when backend is ready)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## 💾 Development Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start              # Start production server

# Cleanup
rm -r node_modules    # Remove dependencies
npm install           # Reinstall (Linux/Mac)
# Or in PowerShell:
rm -Force -Recurse node_modules
npm install
```

---

## 🎮 Game Engine Demo

The editor page includes a simple game engine demo:
```typescript
// src/app/editor/page.tsx (line ~130)

engine.onRender((ctx) => {
  engine.clearCanvas('#1e293b');
  engine.drawRect(50, 50, 100, 100, '#3b82f6');
  engine.drawCircle(250, 150, 40, '#ec4899');
  engine.drawText('WebWorlds', 100, 300, '#fff');
});
```

Try modifying the colors and positions in real-time!

---

## 🔌 API Hooks Ready

All API calls are mocked/ready:
```typescript
import { api, apiClient } from '@/lib/api';

// Games
await apiClient.getGames()
await apiClient.getGame(id)
await apiClient.likeGame(id)

// Auth
await apiClient.getCurrentUser()

// Sessions
await apiClient.createSession(gameId)
```

Connect these to your Railway backend when ready.

---

##📦 Package List

**Key Dependencies:**
- `next@16.1.6` - Framework
- `react@18.2.0` - UI
- `zustand@4.4.0` - State (2.6KB!)
- `tailwindcss@4` - CSS
- `axios@1.6.0` - HTTP
- `socket.io-client@4.7.0` - Real-time
- `lucide-react@0.360.0` - Icons

**Total Bundle:** ~150KB gzipped ✨

---

## 🎯 Common Tasks

### Add a New Page
```bash
# Create new directory
mkdir src/app/mynewpage

# Create page.tsx
# src/app/mynewpage/page.tsx
export default function MyNewPage() {
  return <div>Hello from new page</div>
}
```

### Add a Component
```bash
# Create component
# src/components/MyComponent.tsx
export const MyComponent = () => {
  return <div>My Component</div>
}

# Import & use in pages
import { MyComponent } from '@/components/MyComponent'
```

### Use State (Zustand)
```typescript
import { useAuthStore } from '@/stores/authStore'

export function MyComponent() {
  const { user, login, logout } = useAuthStore()
  
  return <div>{user?.username}</div>
}
```

### Call API
```typescript
import { apiClient } from '@/lib/api'

const games = await apiClient.getGames()
```

---

## 🐛 Debugging

### Enable Debug Mode
```env
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### View State in Console
```typescript
// In any component
import { useGameStore } from '@/stores/gameStore'

export function Debug() {
  const store = useGameStore.getState()
  console.log(store) // View all state
}
```

### Check Network Requests
Open DevTools (F12) → Network tab → See all API calls

---

## 📱 Responsive Design

Frontend is mobile-first:
- Mobile: Works on 320px+ screens
- Tablet: Optimized for 768px+
- Desktop: Full experience at 1024px+

Test with DevTools' device emulation (F12 → Ctrl+Shift+M)

---

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Go to vercel.com
# 3. Click "Import Project"
# 4. Select your GitHub repo
# 5. Add env variables
# 6. Deploy!
```

Vercel auto-deploys on every push to main.

---

## 🆘 Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**Dependencies error?**
```bash
rm -Force -Recurse node_modules
npm install --legacy-peer-deps
```

**Next.js cache issue?**
```bash
rm -Force -Recurse .next
npm run build
```

**Types not working?**
```bash
# Rebuild types
npm run build
```

---

## 📚 Learn More

- **Next.js** → https://nextjs.org/learn
- **React** → https://react.dev
- **Tailwind** → https://tailwindcss.com/docs
- **Zustand** → https://github.com/pmndrs/zustand
- **Socket.io** → https://socket.io/docs/v4/client-api/

---

## 💡 Pro Tips

1. **Use TypeScript** - Catch errors before runtime
2. **Import properly** - Use `@/` for absolute imports
3. **Check types** - Hover over variables to see types
4. **Test mobile** - Always test on mobile (F12)
5. **Monitor bundle** - Watch for unused imports
6. **Use Vercel Analytics** - Monitor real users

---

## ✅ Checklist Before Backend

- [ ] Frontend runs locally
- [ ] All pages load
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Vercel deployment ready
- [ ] Environment file created
- [ ] Backend URLs configured

---

## 🎉 You're All Set!

The frontend is production-ready. Now build the backend on Railway and connect them together!

---

**Happy Coding! 🚀**

Questions? Check the comprehensive docs:
- [plan.md](../plan.md) - Architecture & roadmap
- [FRONTEND_COMPLETE.md](../FRONTEND_COMPLETE.md) - Full feature list
- [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Directory structure
- [frontend/README.md](./README.md) - Frontend specific docs
