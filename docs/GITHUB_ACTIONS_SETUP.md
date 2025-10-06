# GitHub Actions Setup for Supabase Keep-Alive

This document explains how to set up GitHub Actions to keep your Supabase database alive and prevent it from going to sleep.

## 🎯 Purpose

The `keep-alive.yml` workflow runs every 30 minutes to ping your Supabase database, ensuring it stays active and responsive. This is particularly useful for:

- Free/hobby Supabase plans that may sleep after inactivity
- Preventing cold starts and slow initial responses
- Maintaining consistent performance for your React Flow prototype

## 🔧 Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. Go to Repository Settings
1. Navigate to your GitHub repository
2. Click on **Settings** tab
3. Click on **Secrets and variables** → **Actions**

### 2. Add Required Secrets

Add these two secrets with your actual Supabase values:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 3. How to Find Your Supabase Values

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key

## ⚙️ Workflow Configuration

### Schedule
- **Frequency**: Every 30 minutes
- **Cron**: `*/30 * * * *`
- **Manual Trigger**: Available via GitHub Actions tab

### What It Does
1. **Checks out** your repository code
2. **Sets up** Node.js environment
3. **Installs** dependencies
4. **Pings** Supabase database with a simple query
5. **Logs** success/failure status

### Database Query
The workflow performs a lightweight query:
```sql
SELECT id FROM nodes LIMIT 1;
```

This is sufficient to keep the database active without impacting performance.

## 🚀 How to Enable

1. **Add the secrets** (see above)
2. **Push the workflow file** to your repository
3. **Check GitHub Actions tab** to see it running
4. **Monitor logs** for any issues

## 📊 Monitoring

### View Workflow Runs
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Keep Supabase Database Alive** workflow
4. View run history and logs

### Success Indicators
- ✅ Green checkmark on workflow runs
- ✅ "Database ping successful" in logs
- ✅ No error messages

### Troubleshooting
- ❌ **Missing secrets**: Add the required GitHub secrets
- ❌ **Database connection failed**: Check your Supabase URL and key
- ❌ **Permission denied**: Ensure your Supabase project allows anonymous access

## 🔄 Manual Testing

You can manually trigger the workflow:

1. Go to **Actions** tab in your repository
2. Select **Keep Supabase Database Alive**
3. Click **Run workflow**
4. Click **Run workflow** button

## 💡 Benefits

- **Prevents database sleep** on free plans
- **Maintains performance** for your React Flow prototype
- **Automated monitoring** of database health
- **Cost-effective** solution using GitHub's free Actions minutes
- **Reliable** - runs every 30 minutes consistently

## 📝 Notes

- The workflow uses your existing `package.json` dependencies
- No additional packages required
- Runs on GitHub's free tier (2,000 minutes/month)
- Each run takes ~30-60 seconds
- Minimal resource usage

---

**Need help?** Check the GitHub Actions logs or refer to the [Supabase documentation](https://supabase.com/docs) for troubleshooting.
