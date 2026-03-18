# Local Development Guide

## Overview

This app uses **Neon PostgreSQL** database through Vercel serverless API endpoints. There are two modes for local development:

## Mode 1: Standard Local Dev (Recommended)

**Command:** `npm run dev`

**What it does:**
- Runs the frontend with Vite
- Uses **fallback/mock data** for the database
- No database connection required
- Fastest for UI development

**Limitations:**
- No real database data (empty nodes/edges)
- Risks are populated with default values
- Create/Update/Delete operations are simulated

**Best for:** UI development, styling, layout changes

---

## Mode 2: Local with Database

**Command:** `vercel dev`

**What it does:**
- Runs both frontend AND API endpoints locally
- Connects to your actual Neon database
- Full CRUD operations

**Setup Required:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Install `ws` package (for local database connections):**
   ```bash
   npm install ws
   ```

3. **Pull environment variables:**
   ```bash
   vercel env pull .env.local
   ```

4. **Run:**
   ```bash
   vercel dev
   ```

**Note:** Port 3000 will be used (not 5173)

**Best for:** Testing database operations, API development

---

## Mode 3: Production

**URL:** https://mindfuel-prototype-j5o7j5vj4-petermarkellis-projects.vercel.app

**What it does:**
- Fully deployed on Vercel
- Connects to Neon database
- All features working

**Best for:** Demos, testing, production use

---

## Troubleshooting

### "Database Connection Error" with `npm run dev`

This is **expected**! `npm run dev` doesn't run the API endpoints. The app should fall back to mock data automatically.

If you see an error:
1. Check browser console for "Local development mode: Using fallback data"
2. The app should still work with empty nodes/edges
3. Risks will show default values

### `vercel dev` fails to start

1. **Kill existing processes:**
   ```bash
   pkill -f vite
   pkill -f "vercel dev"
   lsof -ti:3000 | xargs kill -9
   ```

2. **Reinstall dependencies:**
   ```bash
   npm install
   npm install ws
   ```

3. **Pull env vars again:**
   ```bash
   vercel env pull .env.local
   ```

4. **Try again:**
   ```bash
   vercel dev
   ```

### Port 3000 already in use

`vercel dev` uses port 3000 by default. If it's taken:

1. Kill the process using port 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. Or use a different port:
   ```bash
   vercel dev --port 3001
   ```

### Database connection fails

1. **Test connection:**
   ```bash
   node test-db.js
   ```

2. **Check .env.local:**
   - Ensure `DATABASE_URL` is set
   - Should start with `postgresql://`

3. **Verify Neon database:**
   - Go to https://console.neon.tech
   - Check your project is active
   - Verify connection string is correct

---

## Quick Reference

| Task | Command | URL |
|------|---------|-----|
| UI Development | `npm run dev` | http://localhost:5173 |
| Full Stack Dev | `vercel dev` | http://localhost:3000 |
| Production | Deployed | https://mindfuel-prototype-j5o7j5vj4-petermarkellis-projects.vercel.app |

---

## Testing Database Connection

Run the test script:
```bash
node test-db.js
```

Expected output:
```
✅ SUCCESS! Connected to Neon database
Found 5 risks:
  - notset: Not Set
  - low: Low
  - medium: Medium
  - high: High
  - critical: Critical
```
