-- Create a simple table for keep-alive logging
CREATE TABLE IF NOT EXISTS keep_alive_logs (
  id SERIAL PRIMARY KEY,
  ping_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  source TEXT DEFAULT 'github_actions',
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_keep_alive_logs_ping_time ON keep_alive_logs(ping_time);

-- Enable RLS (Row Level Security)
ALTER TABLE keep_alive_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for GitHub Actions)
CREATE POLICY "Allow anonymous inserts" ON keep_alive_logs
  FOR INSERT WITH CHECK (true);

-- Allow anonymous selects (for verification)
CREATE POLICY "Allow anonymous selects" ON keep_alive_logs
  FOR SELECT USING (true);

-- Insert a test entry
INSERT INTO keep_alive_logs (status, source, response_time_ms) 
VALUES ('test', 'migration', 0);

-- Clean up old entries (keep only last 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_keep_alive_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM keep_alive_logs 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old entries (if pg_cron is available)
-- This is optional and may not work on all Supabase plans
-- SELECT cron.schedule('cleanup-keep-alive-logs', '0 2 * * *', 'SELECT cleanup_old_keep_alive_logs();');
