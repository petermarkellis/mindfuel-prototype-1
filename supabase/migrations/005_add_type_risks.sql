-- Add a type_risks table to manage risk levels for different node types
-- This allows for proper risk assessment based on the type of node being created

-- First, update the risk_level enum to include 'critical'
ALTER TYPE risk_level ADD VALUE 'critical';

-- Create the type_risks table
CREATE TABLE type_risks (
  id SERIAL PRIMARY KEY,
  node_type node_type NOT NULL UNIQUE,
  default_risk risk_level NOT NULL DEFAULT 'notset',
  risk_description TEXT,
  risk_factors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for auto-updating timestamps
CREATE TRIGGER update_type_risks_updated_at
    BEFORE UPDATE ON type_risks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default risk profiles for each node type
INSERT INTO type_risks (node_type, default_risk, risk_description, risk_factors) VALUES 
(
  'Opportunity',
  'medium',
  'Business opportunities typically carry moderate risk due to market uncertainties and implementation challenges.',
  ARRAY['Market volatility', 'Competition', 'Resource allocation', 'Timeline dependencies']
),
(
  'Product', 
  'high',
  'Data products face significant technical and adoption risks requiring careful planning and execution.',
  ARRAY['Technical complexity', 'User adoption', 'Data quality', 'Integration challenges', 'Performance requirements']
),
(
  'Data Asset',
  'low', 
  'Data assets generally have lower risk as they represent established, valuable information resources.',
  ARRAY['Data freshness', 'Access permissions', 'Storage costs', 'Compliance requirements']
),
(
  'Data Source',
  'medium',
  'Data sources carry moderate risk due to potential reliability, security, and integration concerns.',
  ARRAY['System reliability', 'Data quality', 'Security vulnerabilities', 'API changes', 'Vendor dependency']
);

-- Create an index for faster lookups
CREATE INDEX idx_type_risks_node_type ON type_risks(node_type);

-- Add comments for documentation
COMMENT ON TABLE type_risks IS 'Risk profiles for different node types, used to assign appropriate default risk levels';
COMMENT ON COLUMN type_risks.default_risk IS 'Default risk level assigned to new nodes of this type';
COMMENT ON COLUMN type_risks.risk_description IS 'General description of why this type has this risk level';
COMMENT ON COLUMN type_risks.risk_factors IS 'Array of specific risk factors associated with this node type';

-- Update existing nodes to have more realistic risk values based on their type
UPDATE nodes 
SET risk = tr.default_risk
FROM type_risks tr 
WHERE nodes.node_type = tr.node_type 
AND nodes.risk = 'notset';

-- Add a comment to the nodes table explaining the risk assignment
COMMENT ON COLUMN nodes.risk IS 'Risk level - assigned based on node type defaults from type_risks table, can be manually overridden';
