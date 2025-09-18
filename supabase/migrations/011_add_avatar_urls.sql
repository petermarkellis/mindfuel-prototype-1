-- Add avatar_url column to users table and assign specific avatars
-- This uses the new Supabase storage bucket with optimized webp images

-- Add avatar_url column
ALTER TABLE users 
ADD COLUMN avatar_url TEXT;

-- Update users with gender-appropriate avatars from the storage bucket
-- Female users (4 total): Emily, Jessica, Lisa, Amanda
UPDATE users SET avatar_url = 'Female_1.webp' WHERE first_name = 'Emily';
UPDATE users SET avatar_url = 'Female_2.webp' WHERE first_name = 'Jessica';
UPDATE users SET avatar_url = 'Female_3.webp' WHERE first_name = 'Lisa';
UPDATE users SET avatar_url = 'Female_4.webp' WHERE first_name = 'Amanda';

-- Male users (6 total): Marius, Peter, James, Michael, David, Ryan
UPDATE users SET avatar_url = 'Male_1.webp' WHERE first_name = 'Marius';
UPDATE users SET avatar_url = 'Male_2.webp' WHERE first_name = 'Peter';
UPDATE users SET avatar_url = 'Male_3.webp' WHERE first_name = 'James';
UPDATE users SET avatar_url = 'Male_4.webp' WHERE first_name = 'Michael';
UPDATE users SET avatar_url = 'Male_5.webp' WHERE first_name = 'David';
UPDATE users SET avatar_url = 'Male_6.webp' WHERE first_name = 'Ryan';

-- Add index for avatar_url if needed for queries
CREATE INDEX idx_users_avatar_url ON users(avatar_url);

-- Add comment to document the storage bucket
COMMENT ON COLUMN users.avatar_url IS 'Avatar image filename in Supabase storage bucket "avatars". Format: Gender_Number.webp';
