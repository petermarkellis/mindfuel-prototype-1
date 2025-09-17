-- Simple risks table to store risk level variants
-- This replaces the complex type_risks approach with a simpler solution
-- NOTE: This assumes 006_add_critical_risk.sql has been run first

-- Drop the complex type_risks table if it exists (from previous migration)
DROP TABLE IF EXISTS type_risks;

-- Create a simple risks table with risk level definitions
CREATE TABLE risks (
  id SERIAL PRIMARY KEY,
  level risk_level NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  color_class TEXT, -- For UI styling (chip colors)
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the risk levels
INSERT INTO risks (level, label, description, color_class, sort_order) VALUES 
('notset', 'Not Set', 'Risk level has not been assessed yet', 'risk-notset', 1),
('low', 'Low', 'Minimal risk with low probability of negative impact', 'risk-low', 2),
('medium', 'Medium', 'Moderate risk requiring some monitoring and mitigation', 'risk-medium', 3),
('high', 'High', 'Significant risk requiring active management and mitigation strategies', 'risk-high', 4),
('critical', 'Critical', 'Severe risk requiring immediate attention and comprehensive mitigation', 'risk-critical', 5);

-- Create index for faster lookups
CREATE INDEX idx_risks_level ON risks(level);
CREATE INDEX idx_risks_sort_order ON risks(sort_order);

-- Add comments for documentation
COMMENT ON TABLE risks IS 'Risk level definitions with display information for UI components';
COMMENT ON COLUMN risks.level IS 'Risk level enum value matching the risk_level type';
COMMENT ON COLUMN risks.label IS 'Human-readable label for display in UI';
COMMENT ON COLUMN risks.color_class IS 'Semantic Tailwind CSS class for risk styling (e.g., risk-low, risk-high)';
COMMENT ON COLUMN risks.sort_order IS 'Numeric order for displaying risk levels (1=lowest, 5=highest)';
