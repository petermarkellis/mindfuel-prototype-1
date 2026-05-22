-- Link nodes table to users table via foreign keys
-- This will connect created_by and updated_by columns to actual user records

-- First, let's check the current data types of created_by and updated_by
-- They are likely TEXT fields currently, we need to convert them to integers

-- Step 1: Add temporary columns for the foreign key references
ALTER TABLE nodes ADD COLUMN created_by_user_id INTEGER;
ALTER TABLE nodes ADD COLUMN updated_by_user_id INTEGER;

-- Step 2: Randomly assign existing nodes to users
-- Each node gets a random creator and a random updater (they can be different people)
UPDATE nodes 
SET 
  created_by_user_id = (
    SELECT id FROM users 
    ORDER BY random() 
    LIMIT 1
  ),
  updated_by_user_id = (
    SELECT id FROM users 
    ORDER BY random() 
    LIMIT 1
  );

-- Step 3: Drop the old text columns
ALTER TABLE nodes DROP COLUMN created_by;
ALTER TABLE nodes DROP COLUMN updated_by;

-- Step 4: Rename the new columns to the original names
ALTER TABLE nodes RENAME COLUMN created_by_user_id TO created_by;
ALTER TABLE nodes RENAME COLUMN updated_by_user_id TO updated_by;

-- Step 5: Add foreign key constraints
ALTER TABLE nodes 
  ADD CONSTRAINT fk_nodes_created_by 
  FOREIGN KEY (created_by) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

ALTER TABLE nodes 
  ADD CONSTRAINT fk_nodes_updated_by 
  FOREIGN KEY (updated_by) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

-- Step 6: Add indexes for better performance
CREATE INDEX idx_nodes_created_by ON nodes(created_by);
CREATE INDEX idx_nodes_updated_by ON nodes(updated_by);

-- Step 7: Add comments for documentation
COMMENT ON COLUMN nodes.created_by IS 'Foreign key reference to users.id - who created this node';
COMMENT ON COLUMN nodes.updated_by IS 'Foreign key reference to users.id - who last updated this node';

-- Optional: Create a view to easily see node creators and updaters
CREATE OR REPLACE VIEW nodes_with_users AS
SELECT 
  n.*,
  creator.first_name || ' ' || creator.last_name AS created_by_name,
  creator.email AS created_by_email,
  updater.first_name || ' ' || updater.last_name AS updated_by_name,
  updater.email AS updated_by_email
FROM nodes n
LEFT JOIN users creator ON n.created_by = creator.id
LEFT JOIN users updater ON n.updated_by = updater.id;

COMMENT ON VIEW nodes_with_users IS 'View showing nodes with creator and updater user information joined';
