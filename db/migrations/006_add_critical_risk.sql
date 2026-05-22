-- Add 'critical' to the risk_level enum
-- This must be in a separate migration from where we use the new enum value

-- Add 'critical' to the risk_level enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'critical' AND enumtypid = 'risk_level'::regtype) THEN
        ALTER TYPE risk_level ADD VALUE 'critical';
    END IF;
END $$;
