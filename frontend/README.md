# WebWorlds Frontend

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Update .env.local with your API URL
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Features

- ✅ Home page with hero section
- ✅ Game discovery & browsing
- ✅ Game search & filtering
- ✅ User authentication (login/signup)
- ✅ User profiles
- ✅ Game editor with live preview
- ✅ Ultra-lightweight custom 2D game engine
- ✅ State management (Zustand)
- ✅ API integration
- ✅ Responsive design (mobile-first)
- ✅ Dark theme UI

## Project Structure

```
src/
├── app/
│   ├── login/
│   ├── signup/
│   ├── profile/
│   ├── games/
│   ├── editor/
│   ├── page.tsx (home)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── GameCard.tsx
│   ├── GameFilter.tsx
│   └── ui/
│       └── Tabs.tsx
├── engine/
│   └── wbw-game-engine.ts (WBW runtime engine)
├── lib/
│   └── api-client.ts (axios config & helpers)
├── stores/
│   ├── authStore.ts (Zustand auth store)
│   ├── gameStore.ts (Zustand game store)
│   └── editorStore.ts (Zustand editor store)
└── types/
    └── index.ts (TypeScript definitions)
```

## Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Game Engine:** WBW runtime engine (WBW-only scripts)

## Bundle Size Optimization

- Tree-shaking enabled
- Minimal dependencies
- Code splitting per route
- Image optimization
- CSS purging

**Current build target:** < 200KB gzipped for main bundle

## API Integration

The frontend is pre-configured to communicate with the Railway backend. See `src/lib/api-client.ts` for all available API methods.

## Deployment

### Vercel (Recommended)
```bash
git push origin main
# Auto-deploys on Vercel
```

## Environment Variables

Required for production:
- `NEXT_PUBLIC_API_URL` - Railway backend URL

## License

MIT

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
