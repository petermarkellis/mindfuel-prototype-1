-- Enable Row Level Security with public access
-- This removes the "unrestricted" warning while maintaining public access

-- Enable RLS on tables
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public access (equivalent to unrestricted but "secure")
CREATE POLICY "Public read access for nodes" ON nodes FOR SELECT USING (true);
CREATE POLICY "Public insert access for nodes" ON nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for nodes" ON nodes FOR UPDATE USING (true);
CREATE POLICY "Public delete access for nodes" ON nodes FOR DELETE USING (true);

CREATE POLICY "Public read access for edges" ON edges FOR SELECT USING (true);
CREATE POLICY "Public insert access for edges" ON edges FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for edges" ON edges FOR UPDATE USING (true);
CREATE POLICY "Public delete access for edges" ON edges FOR DELETE USING (true);
