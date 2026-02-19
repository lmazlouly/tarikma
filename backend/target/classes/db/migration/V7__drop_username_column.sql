-- ============================================================
-- V7: Drop legacy username column from users table
-- ============================================================

ALTER TABLE users DROP COLUMN IF EXISTS username;
