-- Add gender column to users table and update existing users
-- This allows us to associate gender-specific avatar images

-- Add gender column with enum type
CREATE TYPE gender_type AS ENUM ('Male', 'Female');

ALTER TABLE users 
ADD COLUMN gender gender_type NOT NULL DEFAULT 'Male';

-- Update existing users with appropriate genders
-- Assign genders based on first names from our existing data
UPDATE users SET gender = 'Female' WHERE first_name IN ('Emily', 'Jessica', 'Lisa', 'Amanda');
UPDATE users SET gender = 'Male' WHERE first_name IN ('Marius', 'Peter', 'James', 'Michael', 'David', 'Ryan');

-- Add index for gender filtering if needed in the future
CREATE INDEX idx_users_gender ON users(gender);
