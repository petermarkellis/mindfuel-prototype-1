# Supabase Database Keep-Alive Setup

This guide helps you prevent your Supabase free tier database from sleeping due to inactivity (7-day pause threshold).

## 🎯 Quick Setup (Recommended)

### Option 1: GitHub Actions (Automated) ⭐
**Best for**: Public repositories, set-and-forget automation

1. **Add GitHub Secrets**:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

2. **Enable the workflow**:
   - The workflow file is already created at `.github/workflows/keep-database-alive.yml`
   - It runs automatically every 6 days
   - You can also trigger it manually from the Actions tab

3. **Test it**:
   ```bash
   # Test locally first
   node dev-tests/keep-alive.js
   ```

### Option 2: Cron Job (Local/Server)
**Best for**: Personal servers, local development machines

1. **Setup cron job**:
   ```bash
   # Edit your crontab
   crontab -e
   
   # Add this line (runs every 6 days at 2 AM)
   0 2 */6 * * cd /path/to/your/project && node dev-tests/keep-alive.js >> /tmp/supabase-keepalive.log 2>&1
   ```

2. **Or create a shell script**:
   ```bash
   # Create keep-alive.sh
   #!/bin/bash
   cd /path/to/your/project
   node dev-tests/keep-alive.js
   
   # Make executable
   chmod +x keep-alive.sh
   
   # Add to crontab
   0 2 */6 * * /path/to/keep-alive.sh
   ```

### Option 3: Vercel/Netlify Function
**Best for**: Deployed applications, serverless functions

1. **Vercel API Route** (`/api/keep-alive.js`):
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   
   export default async function handler(req, res) {
     const supabase = createClient(
       process.env.VITE_SUPABASE_URL,
       process.env.VITE_SUPABASE_ANON_KEY
     )
     
     try {
       const { data, error } = await supabase
         .from('nodes')
         .select('count')
         .limit(1)
       
       if (error) throw error
       
       res.status(200).json({ 
         success: true, 
         timestamp: new Date().toISOString() 
       })
     } catch (error) {
       res.status(500).json({ 
         success: false, 
         error: error.message 
       })
     }
   }
   ```

2. **Setup external monitoring**:
   - Use UptimeRobot, Pingdom, or similar
   - Ping your `/api/keep-alive` endpoint every 6 days

## 🧪 Testing

Test the keep-alive script manually:
```bash
# Test locally
node dev-tests/keep-alive.js

# Should output:
# 🏓 Ping at 2024-01-15T14:30:00.000Z
# ✅ Database is awake and responsive
```

## ⚙️ Configuration Options

### Frequency Settings
- **Conservative**: Every 5 days (safer margin)
- **Standard**: Every 6 days (recommended)  
- **Aggressive**: Every 7 days (risky, might miss window)

### Custom Ping Query
You can modify the ping query in `dev-tests/keep-alive.js`:
```javascript
// Simple count (current)
const { data } = await supabase.from('nodes').select('count').limit(1)

// Or check specific data
const { data } = await supabase.from('nodes').select('id').limit(1)

// Or even update a timestamp
const { data } = await supabase.from('system_health').upsert({
  id: 'keepalive',
  last_ping: new Date().toISOString()
})
```

## 🚨 Monitoring

### Check GitHub Actions
- Go to your repo → Actions tab
- Look for "Keep Supabase Database Alive" workflow
- Green ✅ = successful pings
- Red ❌ = failed pings (check logs)

### Check Supabase Dashboard
- Go to your Supabase project dashboard
- Check "Database" → "Logs" for activity
- Look for regular query activity every 6 days

### Local Logs
If using cron jobs, check logs:
```bash
# Check cron logs
tail -f /tmp/supabase-keepalive.log

# Check system cron logs
tail -f /var/log/cron
```

## 🔧 Troubleshooting

### "Database connection failed"
- Check your environment variables are set correctly
- Verify your Supabase project is active
- Test with `node dev-tests/test-supabase-connection.js`

### "GitHub Action failing"
- Verify secrets are set in GitHub repo settings
- Check the Actions logs for detailed error messages
- Test locally first to isolate the issue

### "Cron job not running"
- Check cron service is running: `systemctl status cron`
- Verify crontab syntax: `crontab -l`
- Check system logs: `/var/log/syslog`

## 💡 Alternative Solutions

### Upgrade to Supabase Pro
- **Cost**: $25/month
- **Benefit**: No database pausing
- **Best for**: Production applications

### Use Supabase Edge Functions
- Create a scheduled edge function
- More native to Supabase ecosystem
- Requires Supabase Pro plan

### External Monitoring Services
- **UptimeRobot**: Free tier available
- **Pingdom**: Professional monitoring
- **Cronitor**: Cron job monitoring

## 📊 Success Metrics

Your database stay-alive setup is working if:
- ✅ Database never shows "paused" status in Supabase dashboard
- ✅ Keep-alive script runs successfully every 6 days
- ✅ Your React app always loads data without delays
- ✅ No "database is starting up" messages

## 🎉 You're All Set!

Your Supabase database will now stay active and ready for your client demos. The automated keep-alive ensures your prototype is always responsive and professional.

