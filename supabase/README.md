# Supabase Database Setup

This folder contains all Supabase-related database files and configurations.

## Folder Structure

```
supabase/
├── README.md                    # This file
├── migrations/                  # Database migration files
│   └── 001_initial_schema.sql   # Initial database schema and data
└── config/                      # Configuration files
    └── database-types.md        # Database schema documentation
```

## Quick Setup Guide

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Click "New Project"
- Choose your organization and set project name
- Select a region close to your users
- Set a strong database password
- Wait for project creation (~2 minutes)

### 2. Run Initial Migration
- In your Supabase dashboard, go to **SQL Editor**
- Copy the contents of `migrations/001_initial_schema.sql`
- Paste into SQL Editor and click **Run**
- Verify tables were created in **Table Editor**

### 3. Get API Credentials
- Go to **Settings** → **API**
- Copy **Project URL** (e.g., `https://abc123.supabase.co`)
- Copy **anon public** key (long JWT token)

### 4. Configure Environment
- Update your `.env` file with the credentials:
  ```env
  VITE_SUPABASE_URL=your_project_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```

### 5. Test Connection
```bash
npm run dev
```

## Database Schema Overview

### Tables Created:
- **nodes** - Stores ReactFlow node data (Opportunities, Products, Data Assets, Data Sources)
- **edges** - Stores connections between nodes

### Features:
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Foreign key constraints for data integrity
- ✅ Indexes for optimal query performance
- ✅ Enums for consistent data types
- ✅ Sample data pre-loaded

## Migration Files

Migration files follow the naming convention: `{number}_{description}.sql`

- `001_initial_schema.sql` - Creates initial database structure and sample data

## Security Setup (RLS)

If you see "unrestricted" on your tables in Supabase, you have 3 options:

### Option 1: Keep Unrestricted (Demo/Development)
- **Best for**: Portfolio demos, development, testing
- **Action**: No action needed - this is fine for demos
- **Security**: Public access (anyone can read/write)

### Option 2: Enable Basic RLS (Public but "Secure")
- **Best for**: Demos that need to show RLS knowledge
- **Action**: Run `migrations/002_enable_basic_rls.sql`
- **Security**: Removes "unrestricted" warning, but still public access

### Option 3: Full Authentication
- **Best for**: Production-ready demos showing auth skills
- **Action**: Run `migrations/003_authenticated_rls.sql`
- **Security**: Only authenticated users can access data
- **Requires**: Implementing Supabase Auth in your React app

## Troubleshooting

### Common Issues:
1. **Environment variables not loaded** - Restart dev server after updating `.env`
2. **Database connection failed** - Check your project URL and API key
3. **Tables not found** - Ensure you ran the migration SQL in Supabase
4. **CORS errors** - Verify you're using the anon key, not the service role key
5. **"Unrestricted" tables** - See Security Setup section above

### Need Help?
- [Supabase Documentation](https://supabase.com/docs)
- [React Integration Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
