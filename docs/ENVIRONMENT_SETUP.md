# Environment Variables Setup

This document explains how to set up environment variables for local development and deployment.

## 📁 Local Development (.env file)

Create a `.env` file in the project root with these variables:

```bash
# Neon PostgreSQL (used by api/ and local-api.js)
DATABASE_URL=postgres://user:password@host.neon.tech/dbname?sslmode=require

# Password protection (frontend demo gate)
VITE_DEMO_PASSWORD=mindfuel2024
VITE_CLIENT_PASSWORD=client_preview
VITE_INVESTOR_PASSWORD=demo_access
```

For local dev with production data, also create `.env.local` with `DATABASE_URL` (see `LOCAL_DEV_README.md`).

## 🚀 Vercel Deployment

Add these environment variables in your Vercel project dashboard:

### Required Variables:
1. **DATABASE_URL** — Neon connection string
2. **VITE_DEMO_PASSWORD** — Main demo password
3. **VITE_CLIENT_PASSWORD** — Client preview password (optional)
4. **VITE_INVESTOR_PASSWORD** — Investor demo password (optional)

### How to Add in Vercel:
1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable with **Production**, **Preview**, and **Development** environments selected

## 🔒 Security Notes

- Passwords and database credentials are not in source code
- All `VITE_*` variables are exposed to the browser — only use them for non-secret demo gate passwords
- Keep `DATABASE_URL` server-side only (Vercel functions / `local-api.js`)
- Changes to environment variables require restarting the dev server or redeploying

## 📝 Notes

- Variables prefixed with `VITE_` are accessible in the React app
- See `docs/NEON_SETUP.md` for database setup details
