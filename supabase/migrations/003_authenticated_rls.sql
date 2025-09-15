-- Enable Row Level Security with user authentication
-- This shows proper security implementation for production apps

-- Enable RLS on tables
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- Add user_id column to track ownership (optional - for multi-user apps)
-- ALTER TABLE nodes ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
-- ALTER TABLE edges ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Policy Option A: Authenticated users can access all data (collaborative app)
CREATE POLICY "Authenticated users can view all nodes" ON nodes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert nodes" ON nodes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update nodes" ON nodes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete nodes" ON nodes FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all edges" ON edges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert edges" ON edges FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update edges" ON edges FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete edges" ON edges FOR DELETE USING (auth.role() = 'authenticated');

-- Policy Option B: Users can only access their own data (uncomment if using user_id)
-- CREATE POLICY "Users can view own nodes" ON nodes FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own nodes" ON nodes FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own nodes" ON nodes FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own nodes" ON nodes FOR DELETE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can view own edges" ON edges FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own edges" ON edges FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own edges" ON edges FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own edges" ON edges FOR DELETE USING (auth.uid() = user_id);
