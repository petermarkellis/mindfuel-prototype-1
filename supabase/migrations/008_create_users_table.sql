-- Create users table for team members
-- This table will store team member information and their availability status

-- Create availability enum
CREATE TYPE availability_status AS ENUM ('offline', 'online');

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  availability availability_status DEFAULT 'offline',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert mock team members
INSERT INTO users (first_name, last_name, email, role, availability) VALUES 
('Marius', 'Thompson', 'marius@mindfuel.ai', 'Product Manager', 'online'),
('Sarah', 'Chen', 'sarah@mindfuel.ai', 'Data Scientist', 'online'),
('James', 'Rodriguez', 'james@mindfuel.ai', 'Software Engineer', 'offline'),
('Emily', 'Johnson', 'emily@mindfuel.ai', 'UX Designer', 'online'),
('Michael', 'Kim', 'michael@mindfuel.ai', 'DevOps Engineer', 'offline'),
('Jessica', 'Williams', 'jessica@mindfuel.ai', 'Data Analyst', 'online'),
('David', 'Brown', 'david@mindfuel.ai', 'Backend Engineer', 'online'),
('Lisa', 'Davis', 'lisa@mindfuel.ai', 'Frontend Engineer', 'offline'),
('Ryan', 'Wilson', 'ryan@mindfuel.ai', 'QA Engineer', 'online'),
('Amanda', 'Taylor', 'amanda@mindfuel.ai', 'Project Manager', 'offline');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_availability ON users(availability);
CREATE INDEX idx_users_role ON users(role);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'Team members with their contact information and availability status';
COMMENT ON COLUMN users.first_name IS 'First name of the team member';
COMMENT ON COLUMN users.last_name IS 'Last name of the team member';
COMMENT ON COLUMN users.email IS 'Email address with mindfuel.ai domain';
COMMENT ON COLUMN users.role IS 'Job role/position of the team member';
COMMENT ON COLUMN users.availability IS 'Current availability status (online/offline)';
COMMENT ON COLUMN users.created_at IS 'Timestamp when the user record was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when the user record was last updated';
