-- Update any existing nodes that have NULL values for potential and total_contribution
-- This ensures all nodes have meaningful values for the side panel display

-- Update nodes with NULL potential values
UPDATE nodes 
SET potential = (RANDOM() * 40 + 60)::INTEGER 
WHERE potential IS NULL;

-- Update nodes with NULL total_contribution values  
UPDATE nodes 
SET total_contribution = (RANDOM() * 50 + 40)::INTEGER 
WHERE total_contribution IS NULL;

-- Update nodes with NULL success_potential values
UPDATE nodes 
SET success_potential = (RANDOM() * 20 + 80)::INTEGER 
WHERE success_potential IS NULL;

-- Add comments to clarify these are temporary values
COMMENT ON COLUMN nodes.potential IS 'Potential score (0-100) - currently using random values pending calculation logic implementation';
COMMENT ON COLUMN nodes.total_contribution IS 'Total contribution score (0-100) - currently using random values pending calculation logic implementation';
COMMENT ON COLUMN nodes.success_potential IS 'Success potential score (0-100) - currently using random values pending calculation logic implementation';
