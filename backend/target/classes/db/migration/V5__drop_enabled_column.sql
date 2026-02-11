-- The 'enabled' column from V1 was supposed to be dropped in V2,
-- but may still exist if V2 was partially applied before the DROP ran.
ALTER TABLE users DROP COLUMN IF EXISTS enabled;
