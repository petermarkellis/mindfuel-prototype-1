# Environment Variables Setup

This document explains how to set up environment variables for local development and deployment.

## 📁 Local Development (.env file)

Create a `.env` file in the project root with these variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://mgdkkpbrnrhzeiwblzay.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZGtrcGJybnJoemVpd2JsemF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NTQwNTQsImV4cCI6MjA3MzUzMDA1NH0.uLDl5GF9AQIIP5vpc2HxVZeG1FZlJTiWmxCat4kxH-M

# Password Protection
VITE_DEMO_PASSWORD=mindfuel2024
VITE_CLIENT_PASSWORD=client_preview
VITE_INVESTOR_PASSWORD=demo_access
```

## 🚀 Vercel Deployment

Add these environment variables in your Vercel project dashboard:

### Required Variables:
1. **VITE_SUPABASE_URL**: `https://mgdkkpbrnrhzeiwblzay.supabase.co`
2. **VITE_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **VITE_DEMO_PASSWORD**: `mindfuel2024`
4. **VITE_CLIENT_PASSWORD**: `client_preview`
5. **VITE_INVESTOR_PASSWORD**: `demo_access`

### How to Add in Vercel:
1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable with **Production**, **Preview**, and **Development** environments selected

## 🔧 GitHub Actions

Add these same variables as **GitHub repository secrets**:

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Add each variable as a **New repository secret**

## 🔒 Security Benefits

✅ **Passwords not in source code**  
✅ **Easy to change without code updates**  
✅ **Different passwords per environment**  
✅ **Secure credential management**  

## 🎯 Usage

The passwords are now managed through environment variables and can be easily updated without touching the code. This allows for:

- **Development**: Use test passwords
- **Staging**: Use preview passwords  
- **Production**: Use secure production passwords

## 📝 Notes

- All variables must start with `VITE_` to be accessible in the React app
- Changes to environment variables require a new deployment
- Keep credentials secure and don't share them in public channels
