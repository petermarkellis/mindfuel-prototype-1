# Local Development with Production Database

## 🚀 Quick Start (Recommended)

Run both the local API server and frontend together:

```bash
npm run dev:full
```

This starts:
1. **Local API server** on http://localhost:3001 (connects to your production Neon database)
2. **Vite dev server** on http://localhost:5173 (your app)

**Result:** You see real production data locally! ✅

---

## 📋 Alternative: Run Separately

### Terminal 1 - Start Local API Server:
```bash
npm run dev:local
```

### Terminal 2 - Start Frontend:
```bash
npm run dev
```

---

## 🔧 How It Works

```
┌─────────────────┐
│  Your Browser   │
│ localhost:5173  │
└────────┬────────┘
         │
         ↓ Makes API requests to localhost:3001
┌─────────────────┐
│  Local API      │
│  Server         │
│ localhost:3001  │
└────────┬────────┘
         │
         ↓ Connects via WebSocket
┌─────────────────┐
│  Neon Database  │
│  (Production)   │
└─────────────────┘
```

---

## ✅ What You Get

- **Real data** from your production Neon database
- **Fast iteration** with Vite HMR
- **Full CRUD operations** work locally
- **No Docker** needed
- **Offline mode** falls back to mock data if API server not running

---

## 🛑 Stop Servers

Press `Ctrl+C` in both terminals, or:

```bash
pkill -f "local-api.js"
pkill -f "vite"
```

---

## 📝 Notes

- Requires `.env.local` with your `DATABASE_URL`
- The local API server uses the **same production database** as your deployed app
- Changes you make locally will affect production data!
- For safe testing without affecting production, create a separate Neon branch
