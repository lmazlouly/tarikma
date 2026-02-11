-- V3: Ensure full_name column exists on users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);

-- Backfill full_name from email for any existing rows where full_name is null
UPDATE users SET full_name = email WHERE full_name IS NULL;

-- Apply NOT NULL constraint
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
