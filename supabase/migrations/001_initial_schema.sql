-- Supabase Database Schema for ReactFlow Node Graph
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
-- CREATE POLICY statements will be added if authentication is implemented later

-- Create enum for risk levels
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'notset');

-- Create enum for node types  
CREATE TYPE node_type AS ENUM ('Opportunity', 'Product', 'Data Asset', 'Data Source');

-- Nodes table
CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'custom',
  node_type node_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  potential INTEGER,
  total_contribution INTEGER,
  risk risk_level DEFAULT 'notset',
  success_potential INTEGER,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0
);

-- Edges table
CREATE TABLE edges (
  id TEXT PRIMARY KEY,
  source_node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'custom',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_nodes_node_type ON nodes(node_type);
CREATE INDEX idx_nodes_created_at ON nodes(created_at);
CREATE INDEX idx_edges_source ON edges(source_node_id);
CREATE INDEX idx_edges_target ON edges(target_node_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nodes_updated_at
    BEFORE UPDATE ON nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_edges_updated_at
    BEFORE UPDATE ON edges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (existing nodes from the app)
INSERT INTO nodes (id, type, node_type, name, description, potential, total_contribution, risk, success_potential, created_by, created_at, updated_by, updated_at, position_x, position_y) VALUES 
(
  '1', 
  'custom', 
  'Opportunity', 
  'Enhance Customer Experience', 
  'Drive satisfaction and loyalty by leveraging comprehensive data insights to deliver personalized experiences and support, ensuring each interaction resonates with customers on a deeper level and strengthens their connection to the brand.',
  72,
  45,
  'medium',
  92,
  'Peter Ellis',
  '2024-05-01T00:00:00Z',
  'Marius Försch',
  '2024-06-12T00:00:00Z',
  0,
  50
),
(
  '2',
  'custom',
  'Product',
  'Customer Engagement Platform',
  'Empower businesses to foster meaningful interactions and support through tailored messaging, proactive engagement strategies, and personalized assistance, ultimately enhancing customer satisfaction and loyalty.',
  88,
  45,
  'low',
  92,
  'Peter Ellis',
  '2024-05-01T00:00:00Z',
  'Marius Försch',
  '2024-06-12T00:00:00Z',
  -350,
  450
),
(
  '3',
  'custom',
  'Product',
  'Personalized Recommendation System',
  'Enhance user satisfaction and retention by providing highly relevant product recommendations based on individual preferences, past behavior, and demographic information, delivering a more personalized and engaging shopping experience.',
  66,
  78,
  'medium',
  92,
  'Peter Ellis',
  '2024-05-01T00:00:00Z',
  'Marius Försch',
  '2024-06-12T00:00:00Z',
  350,
  450
),
(
  '4',
  'custom',
  'Data Asset',
  'Customer Interaction Data',
  'Comprehensive dataset capturing customer touchpoints, communication preferences, and engagement patterns across multiple channels, providing valuable insights for personalized service delivery and relationship management.',
  82,
  67,
  'low',
  92,
  'Peter Ellis',
  '2024-05-01T00:00:00Z',
  'Marius Försch',
  '2024-06-12T00:00:00Z',
  -350,
  800
),
(
  '5',
  'custom',
  'Data Asset',
  'Purchase History & Preferences',
  'Detailed records of customer transactions, product preferences, and buying patterns that enable targeted recommendations and personalized marketing strategies to enhance customer satisfaction and drive sales growth.',
  78,
  89,
  'medium',
  92,
  'Peter Ellis',
  '2024-05-01T00:00:00Z',
  'Marius Försch',
  '2024-06-12T00:00:00Z',
  350,
  800
),
(
  '6',
  'custom',
  'Data Source',
  'CRM System',
  'Centralized customer relationship management platform containing contact information, interaction history, sales data, and customer lifecycle insights essential for maintaining strong business relationships.',
  88,
  92,
  'low',
  92,
  'Peter Ellis',
  '2024-05-01T00:00:00Z',
  'Marius Försch',
  '2024-06-12T00:00:00Z',
  150,
  1150
),
(
  '7',
  'custom',
  'Data Source',
  'E-commerce Platform',
  'Online retail system tracking product views, cart additions, purchase completions, and user behavior analytics, serving as a primary source for understanding customer preferences and shopping patterns.',
  76,
  85,
  'medium',
  92,
  'Peter Ellis',
  '2024-05-01T00:00:00Z',
  'Marius Försch',
  '2024-06-12T00:00:00Z',
  550,
  1150
),
(
  '8',
  'custom',
  'Data Source',
  'Analytics Platform',
  'Advanced data processing and analysis tool providing real-time insights, performance metrics, and predictive analytics to support data-driven decision making and strategic business planning.',
  84,
  78,
  'high',
  92,
  'Peter Ellis',
  '2024-05-01T00:00:00Z',
  'Marius Försch',
  '2024-06-12T00:00:00Z',
  550,
  800
);

-- Insert edges (relationships between nodes)
INSERT INTO edges (id, source_node_id, target_node_id, type) VALUES 
('e1-2', '1', '2', 'custom'),
('e1-3', '1', '3', 'custom'),
('e1-4', '2', '4', 'custom'),
('e1-5', '4', '5', 'custom'),
('e1-6', '5', '6', 'custom'),
('e1-7', '5', '7', 'custom'),
('e1-8', '3', '8', 'custom');

-- Optional: Enable Row Level Security (uncomment if you want to add authentication later)
-- ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment and modify if implementing authentication)
-- CREATE POLICY "Users can view all nodes" ON nodes FOR SELECT USING (true);
-- CREATE POLICY "Users can insert nodes" ON nodes FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Users can update nodes" ON nodes FOR UPDATE USING (true);
-- CREATE POLICY "Users can delete nodes" ON nodes FOR DELETE USING (true);

-- CREATE POLICY "Users can view all edges" ON edges FOR SELECT USING (true);
-- CREATE POLICY "Users can insert edges" ON edges FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Users can update edges" ON edges FOR UPDATE USING (true);
-- CREATE POLICY "Users can delete edges" ON edges FOR DELETE USING (true);
